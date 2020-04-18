const {RemoteCouchApi} = require('./remote-couch-api')
const {StoreApi} = require('./store-api')
const {PouchAdapter, IndexedDBPouchAdapter} = require('./pouch-adapter')
const {EntityApi} = require('./entity-api')

module.exports = {
  EntityApi, StoreApi, RemoteCouchApi, PouchAdapter, IndexedDBPouchAdapter,
}
