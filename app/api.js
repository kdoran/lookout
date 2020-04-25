const {EntityApi, PouchDB, RemoteCouchApi, IndexedDBPouchAdapter} = require('../api')

const couchLinkProps = {
  description: 'a local only cache of remote couchdb urls the user has visited',
  schema: {
    name: 'couchLink',
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
}

const adapter = new IndexedDBPouchAdapter({...couchLinkProps, pouchDBName: 'couchLink'})
// TODO: username pass
const couchLinkApi = new EntityApi({...couchLinkProps, user: {name: 'lookout-todo'}, adapter})

module.exports = {RemoteCouchApi, couchLinkApi, PouchDB}
