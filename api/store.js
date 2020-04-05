const {getFetch} = require('./get-fetch')

class StoreApi {
  constructor (url) {
    this.url = url
    this.fetcher = getFetch({url})
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

  async list (params = {}) {

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