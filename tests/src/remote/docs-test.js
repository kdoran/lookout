const test = require('../../smalltest')
const {StoreApi} = require('../../../api')

const api = new StoreApi(process.env.TEST_URL)

test('api databases setup', async t => {
  await api.login(process.env.TEST_ADMIN_USERNAME, process.env.TEST_ADMIN_PASSWORD)
  try {
    await api.createDatabase(process.env.TEST_DATABASE_NAME)
  } catch (error) {
    if (error.status === 412) {
      console.warn(`test database ${process.env.TEST_DATABASE_NAME} already exists`)
      return
    }
    throw error
  }
})

test('api setDatabase', async t => {
  try {
    await api.list()
    t.fail()
  } catch (error) {
    t.ok(error, 'throws error if setDatabase has not been called before list')
  }
})

test('api list', async t => {
  api.setDatabase(process.env.TEST_DATABASE_NAME)
  const response = await api.list()
  t.ok(Array.isArray(response), 'returns rows')
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