const {RemoteCouchApi} = require('./remote-couch-api')
const {StoreApi} = require('./store-api')
const {PouchAdapter, IndexedDBPouchAdapter} = require('./pouch-adapter')
const {Adapter} = require('./adapter')

module.exports = {
  Adapter, StoreApi, RemoteCouchApi, PouchAdapter, IndexedDBPouchAdapter, 
}
