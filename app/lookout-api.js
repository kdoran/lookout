const {StoreApi, RemoteCouchApi, IndexedDBPouchAdapter} = require('../api')

const couchLink = {
  name: 'couchLink',
  description: 'a local only cache of remote couchdb urls the user has visited',
  schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
      },
      url: {
        type: 'string',
        minLength: 1,
      }
    },
    required: ['name', 'url'],
    additionalProperties: false
  },
  AdapterConstructor: IndexedDBPouchAdapter
}

class LookoutStoreApi extends StoreApi {
  constructor () {
    super([couchLink])
  }

  getPouchDB ({name, database, url}) {
    this.databases = this.databases || {}
    if (this.databases[name]) return this.databases[name]
    this.databases[name] = new RemoteCouchApi(url).getPouchInstance(database)
    return this.databases[name]
  }
}

const lookoutApi = new LookoutStoreApi()

module.exports = {RemoteCouchApi, lookoutApi}
