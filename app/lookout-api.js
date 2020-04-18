const {StoreApi, RemoteCouchApi, PouchAdapter} = require('../api')

class CouchLinkApi extends PouchAdapter {
  constructor () {
    const name = 'couchLink'
    const schema = {
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
    }
    super(name, schema)
  }
}

class LookoutStoreApi extends StoreApi {
  getPouchDB ({name, database, url}) {
    this.databases = this.databases || {}
    if (this.databases[name]) return this.databases[name]
    this.databases[name] = new RemoteCouchApi(url).getPouchInstance(database)
    return this.databases[name]
  }
}

const lookoutApi = new LookoutStoreApi([CouchLinkApi])

module.exports = {RemoteCouchApi, lookoutApi}
