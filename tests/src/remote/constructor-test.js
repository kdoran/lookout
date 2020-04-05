const test = require('../../smalltest')
const {StoreApi} = require('../../../api')

const api = new StoreApi(process.env.TEST_URL)

test('api test getCurrentUser on empty', async t => {
  await api.logout()
  let user = await api.getCurrentUser()
  t.notOk(user, 'sees no user')
})

test('api admin login', async t => {
  try {
    const user = await api.login()
    t.fail()
  } catch (error) {
    t.ok(error, 'fails without credentials')
  }

  const user = await api.login(process.env.TEST_ADMIN_USERNAME, process.env.TEST_ADMIN_PASSWORD)
  t.ok(user, 'login works')
  const currentUser = await api.getCurrentUser()
  t.deepEquals(user, currentUser, 'returns current user')
})

test('api constructor non admin login', async t => {
  try {
    const user = await api.login()
    t.fail()
  } catch (error) {
    t.ok(error, 'fails without credentials')
  }

  const user = await api.login(process.env.TEST_USERNAME, process.env.TEST_PASSWORD)
  t.ok(user, 'login on normal user works')
  const currentUser = await api.getCurrentUser()
  t.deepEquals(user, currentUser, 'returns current user')
})

// const api = new Api(url)
// // returns null if not there
// let user = await api.getCurrentUser()
//
// if (!user) {
//   // you try/catch this with actual error
//   user = await api.login(username, password)
// }
//
// const databases = await api.listDatabases()
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