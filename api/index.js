const {RemoteCouchApi} = require('./remote-couch-api')
const {PouchAdapter, IndexedDBPouchAdapter} = require('./pouch-adapter')
const {EntityApi} = require('./entity-api')
const {PouchDB} = require('./pouchdb')

module.exports = {
  EntityApi,
  PouchDB,
  RemoteCouchApi,
  PouchAdapter,
  IndexedDBPouchAdapter
}
