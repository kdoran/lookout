const {getFetch} = require('./get-fetch')
const {PouchDB} = require('./pouchdb')

class StoreApi {
  constructor (url) {
    this.url = url
    this.fetcher = getFetch({url})
    this.databases = {}
    // this will probably change to support node
    // will have to deal with setDatabase & username/passwords
    this.PouchDBConstructor = PouchDB.defaults({prefix: url})
  }

  async logout () {
    await this.fetcher('_session', {method: 'DELETE'})
    this.user = null
  }

  async getCurrentUser () {
    const session = await this.getCurrentSession()
    if (!session) return null

    return this.getUserFromSession(session)
  }

  async getCurrentSession () {
    const {userCtx} = await this.fetcher('_session')
    // this is couch telling us there's no session
    if (!userCtx.name) return null
    return userCtx
  }

  async getUserFromSession (session) {
    // couchdb's way of saying admin user, usually does not have a user doc
    if (session.roles && session.roles.includes('_admin')) {
      delete session.ok
      this.user = session
      return session
    }

    const user = await this.fetcher(`_users/org.couchdb.user:${session.name}`)
    this.user = user
    return user
  }

  async login (username = '', password = '') {
    const session = await this.fetcher(
      '_session', {method: 'POST', body: JSON.stringify({username, password})}
    )
    return this.getUserFromSession(session)
  }

  async listDatabases () {
    return this.fetcher('_all_dbs')
  }

  async createDatabase (databaseName) {
    return this.fetcher(databaseName, {method: 'PUT'})
  }

  async getDatabase (databaseName) {
    return this.fetcher(databaseName)
  }

  async destroyDatabase (databaseName) {
    return this.fetcher(databaseName, {method: 'DELETE'})
  }

  async list (params = {}) {
    const options = Object.assign({}, {include_docs: true}, params)
    const db = this.getDatabase()
    const response = await db.allDocs(options)
    return options.include_docs
      ? response.rows.map(row => row.doc)
      : response.rows
  }

  setDatabase (databaseName) {
    if (!this.databases[databaseName]) {
      this.databases[databaseName] = new this.PouchDBConstructor(databaseName)
    }

    this.currentDatabase = this.databases[databaseName]
  }

  getDatabase () {
    if (!this.currentDatabase) {
      throw new Error('error: store.currentDatabase is not defined, call setDatabase first')
    }

    return this.currentDatabase
  }

  async create (doc) {
    if (doc._rev || !doc._id) {
      throw new Error('crearte expects doc with an _id and without a _rev ')
    }

    const db = this.getDatabase()
    await db.put(doc)
    return this.get(doc._id)
  }

  createMany (docs) {
    const db = this.getDatabase()

    docs.forEach(doc => {
      if (doc._rev || !doc._id) {
        throw new Error('crearte expects doc with an _id and without a _rev ')
      }
    })

    return db.bulkDocs(docs)
  }

  async get (id) {
    const db = this.getDatabase()
    return db.get(id)
  }

  async update (doc) {
    if (!doc._rev || !doc._id) {
      throw new Error('update expects full doc')
    }

    const db = this.getDatabase()
    await db.put(doc)
    return this.get(doc._id)
  }

  async destroy (docId) {
    const db = this.getDatabase()
    const doc = await this.get(docId)
    doc._deleted = true
    return db.put(doc)
  }

  // heads up: this will fail any doc validation functions
  // that don't handle _deleted
  async destroyMany (docs) {
    const db = this.getDatabase()
    const deletedDocs = docs.map(doc => {
      const {_id, _rev} = doc
      return {_id, _rev, _deleted: true}
    })

    return db.bulkDocs(deletedDocs)
  }

  query (params) {
    const db = this.getDatabase()
    return db.find(params)
  }
}

module.exports = {StoreApi}