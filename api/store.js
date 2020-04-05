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

  async create () {

  }

  async get () {

  }

  async update () {

  }

  async createMany () {

  }
}

module.exports = {StoreApi}