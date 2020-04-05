const test = require('../../smalltest')
const {StoreApi} = require('../../../api')

const api = new StoreApi(process.env.TEST_URL)

test('api databases setup', async t => {
  await api.login(process.env.TEST_ADMIN_USERNAME, process.env.TEST_ADMIN_PASSWORD)
})

test('api databases list', async t => {
  const databases = await api.listDatabases()
  t.ok(databases.length, 'returns databases')
})



//
// // creates a pouch session if it doesn't exist
// api.setDatabase(databases[0].name)
//
// // raw documents on a database-level (no knowledge of schemas, validation)
// api.create(docWithId)
// api.update(fullDocUpdate)
// api.get(docId)
// api.list({limit, offset})
// api.destroy(docId)
// api.createMany([doc1, doc2])
// api.destroyMany(docId)
// api.query(couchFindParams)
//
// // deletes remote session
// api.logout()
// // closes open pouchdbs but does not logout
// api.close()