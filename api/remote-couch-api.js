const {getFetch} = require('./get-fetch')
const {PouchDB} = require('./pouchdb')

class RemoteCouchApi {
  constructor (url) {
    url = url.endsWith('/') ? url : `${url}/`

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

  getConfigUrl () {
    const isLocal = this.url.includes('://localhost:') || this.url.includes('://127.0.0.1:')
    return isLocal
      ? `_node/couchdb@localhost/_config`
      : `_node/nonode@nohost/_config`
  }

  async getConfig () {
    return this.fetcher(`${this.getConfigUrl()}`)
  }

  async getAdminConfig () {
    return this.fetcher(`${this.getConfigUrl()}/admins`)
  }

  async updateAdmin (username, password) {
    const url = `${this.getConfigUrl()}/admins/${username}`
    return this.fetcher(url, {method: 'PUT', body: `"${password}"`})
  }

  getPouchInstance (databaseName) {
    if (!this.databases[databaseName]) {
      this.databases[databaseName] = new this.PouchDBConstructor(databaseName)
    }

    return this.databases[databaseName]
  }

  async listDatabases () {
    return this.fetcher('_all_dbs')
  }

  async listInfos (keys) {
    try {
      const response = await this.fetcher('_dbs_info', {method: 'POST', body: JSON.stringify({keys})})
      return response
    } catch (error) {
      if (error.status !== 404) throw error

      const promises = keys.map(dbName => this.getDatabase(dbName))
      const response = await Promise.all(promises)
      // make same shape as _dbs_info
      return response.map((info, index) => ({key: keys[index], info}))
    }
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