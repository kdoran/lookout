const test = require('../../smalltest')
const {RemoteCouchApi} = require('../../../api')

const api = new RemoteCouchApi(process.env.TEST_URL)

test('api databases setup', async t => {
  await api.login(process.env.TEST_ADMIN_USERNAME, process.env.TEST_ADMIN_PASSWORD)
  try {
    await api.destroyDatabase(process.env.TEST_DATABASE_NAME)
    console.warn(`test database ${process.env.TEST_DATABASE_NAME} already exists`)
  } catch (error) {
    // pass
  }
})

test('api get pouch test', async t => {
  const pouch = api.getPouchInstance(process.env.TEST_DATABASE_NAME)
  console.log(pouch)
  const response = await pouch.allDocs()
  t.ok(Array.isArray(response.rows), 'runs a pouch call')
  await pouch.destroy()
})

test('api databases teardown / destroy', async t => {
  try {
    await api.destroyDatabase(process.env.TEST_DATABASE_NAME)
  } catch (error) {

  }
})
