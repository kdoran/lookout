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

class LookoutApi {
  constructor () {
    const couchLinkDB = new PouchDB('couchLink')
    const adapter = new PouchAdapter(couchLinkSchema, couchLinkDB)
    this.couchLink = new Model(couchLinkSchema, adapter)
  }

  setCouchServer (url) {
    this.couchServer = new CouchServer(url)
  }
}

module.exports = {LookoutApi, PouchDB}
