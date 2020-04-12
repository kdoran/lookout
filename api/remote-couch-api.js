const {getFetch} = require('./get-fetch')
const {PouchDB} = require('./pouchdb')

class RemoteCouchApi {
  constructor (url) {
    url = url.endsWith('/')
      ? url
      : `${url}/`
    this.url = url
    this.fetcher = getFetch({url})
    // this will probably change to support node
    // will have to deal with setDatabase & username/passwords
    this.PouchDBConstructor = PouchDB.defaults({prefix: url})
    this.databases = {}
  }

  // TODO: user stuff in its own class that this one extends,
  // probably will need a base "remote couch interface" class
  // RemoteCouchAPI
  //  constructor: (url, username, password) {this = those things}
  // UserCouchApi extends RemoteCouchAPI
  // RemoteCouchApi extends UserCouchApi
  // OR this.currentUser = new UserCouchApi(url)
  // this.currentUser.get()
  // this.currentUser.login()
  // this.currentUser.logout()
  async logout () {
    await this.fetcher('_session', {method: 'DELETE'})
    this.user = null
  }

  getPouchInstance (databaseName) {
    if (!this.databases[databaseName]) {
      this.databases[databaseName] = new this.PouchDBConstructor(databaseName)
    }

    return this.databases[databaseName]
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
}

module.exports = {RemoteCouchApi}