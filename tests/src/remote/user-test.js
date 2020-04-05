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

test('api user teardown', async t => {
  await api.logout()
})
