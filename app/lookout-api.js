const {RemoteCouchApi} = require('../api')
const {StoreApi, EntityApi} = require('../api')

class CouchLinkApi extends EntityApi {
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
  // for each remote couch the user has accessed,
  // try and get its list of databases if there is access
  async listAll () {
    const allCouchLinks = await this.couchLink.list()
    const promises = allCouchLinks.map(({url}) => {
      return (new RemoteCouchApi(url)).listDatabases()
        .catch(error => {
          return []
        })
    })
    const databases = await Promise.all(promises)
    return allCouchLinks
      .map((couchLink, index) => ({...couchLink, databases: databases[index]}))
      .reduce((acc, couchLink) => {
        return acc.concat(
          couchLink.databases.map(database => ({database, ...couchLink}))
        )
      }, [])
  }

  getPouchDB ({name, database, url}) {
    this.databases = this.databases || {}
    if (this.databases[name]) return this.databases[name]
    this.databases[name] = new RemoteCouchApi(url).getPouchInstance(database)
    return this.databases[name]
  }
}

const lookoutApi = new LookoutStoreApi([CouchLinkApi])

module.exports = {RemoteCouchApi, lookoutApi}
