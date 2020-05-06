const test = require('../../smalltest')
const {CouchServer} = require('../../../api')

const api = new CouchServer(process.env.TEST_URL)

test('api databases setup', async t => {
  await api.login(process.env.TEST_ADMIN_USERNAME, process.env.TEST_ADMIN_PASSWORD)
  try {
    await api.destroyDatabase(process.env.TEST_DATABASE_NAME)
    console.warn(`test database ${process.env.TEST_DATABASE_NAME} already exists`)
  } catch (error) {
    // pass
  }
})

test('api databases list', async t => {
  const databases = await api.listDatabases()
  t.ok(databases.length, 'returns databases')
})

test('api databases create', async t => {
  await api.createDatabase(process.env.TEST_DATABASE_NAME)
  const response = await api.getDatabase(process.env.TEST_DATABASE_NAME)
  t.ok(response, 'creates and returns a database')
})

test('api databases teardown / destroy', async t => {
  await api.destroyDatabase(process.env.TEST_DATABASE_NAME)
  try {
    await api.getDatabase(process.env.TEST_DATABASE_NAME)
    t.fail()
  } catch (error) {
    t.ok(error, 'destroys database')
  }
})
