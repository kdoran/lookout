// see note in webpack config about this goofy movie.
const PouchDB = pickModule(require('pouchdb-core'))
const idbAdapter = pickModule(require('pouchdb-adapter-idb'))
const memoryAdapter = pickModule(require('pouchdb-adapter-memory'))
const httpAdapter = pickModule(require('pouchdb-adapter-http'))
const replication = pickModule(require('pouchdb-replication'))
const find = pickModule(require('pouchdb-find'))
const mapReduce = pickModule(require('pouchdb-mapreduce'))

PouchDB
  .plugin(idbAdapter)
  .plugin(httpAdapter)
  .plugin(replication)
  .plugin(mapReduce)
  .plugin(memoryAdapter)
  .plugin(find)

// pouch exports modules in a way that you cannot simply "require" these in
// node as well as in webpack, which is why we need this workaround:
// https://github.com/pouchdb-community/pouchdb-authentication/issues/164#issuecomment-357697828
function pickModule (mod) {
  return 'default' in mod ? mod.default : mod
}

module.exports = PouchDB
