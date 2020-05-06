const {
  Model, PouchDB, CouchServer, PouchAdapter
} = require('../api')

const couchLinkSchema = {
  name: 'couchLink',
  description: 'a local only cache of remote couchdb urls the user has visited',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    },
    url: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['name', 'url'],
  additionalProperties: false
}

class MorianaCouchServer extends CouchServer {
  async getUserFromSession (session) {
    const user = await super.getUserFromSession(session)
    this.parent.currentUser = user
    return user
  }
}

class LookoutApi {
  constructor () {
    const couchLinkDB = new PouchDB('couchLink')
    const adapter = new PouchAdapter(couchLinkSchema, couchLinkDB)
    this.couchLink = new Model(couchLinkSchema, adapter)
  }

  // TODO: tidy this up
  set currentUser (user) {
    this.user = user
    this.couchLink.user = user
    this.couchLink.adapter.user = user
  }

  setCouchServer (url) {
    this.couchServer = new MorianaCouchServer(url)
    this.couchServer.parent = this
  }
}

module.exports = {LookoutApi, PouchDB}
