const test = require('../../smalltest')
const {StoreApi} = require('../../../api')

const api = new StoreApi(process.env.TEST_URL)

test('api docs setup', async t => {
  await api.login(process.env.TEST_ADMIN_USERNAME, process.env.TEST_ADMIN_PASSWORD)
  // for when a test being changed gets messed up
  // await api.destroyDatabase(process.env.TEST_DATABASE_NAME)
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

test('api docs list', async t => {
  api.setDatabase(process.env.TEST_DATABASE_NAME)
  const response = await api.list()
  t.ok(Array.isArray(response), 'returns rows')
})

test('api doc create, get', async t => {
  const response = await api.create({_id: 'test', prop: true})
  t.ok(response._rev, 'returns doc after create')
  const response2 = await api.get('test')
  t.ok(response2.prop, 'returns doc')
})

test('api doc update', async t => {
  const current = await api.get('test')
  current.prop = false
  const update = await api.update(current)
  t.notOk(update.prop, 'updates doc')
  t.ok(update._rev !== current._rev, 'sees rev change')
})

test('api doc destroy', async t => {
  await api.destroy('test')
  try {
    const doc = await api.get('test')
    t.fail()
  } catch (error) {
    t.ok(error, 'removes doc with _deleted')
  }
})

test('api docs createMany', async t => {
  const docs = [...Array(100)].map((empty, index) => ({_id: '' + index}))
  const response = await api.createMany(docs)
  t.ok(response.every(x => x.rev), 'bulk creates docs and returns couch response')
})

test('api docs: destroyMany', async t => {
  const docs = await api.list()
  await api.destroyMany(docs)
  const afterDocs = await api.list()
  t.equals(afterDocs.length, 0, 'destroys docs')
})

test('api docs: query', async t => {
  await api.create({_id: 'test-2', prop: true})

  const response = await api.query({selector: {'_id': {'$eq': 'test-2'}}})

  t.equals(response.docs[0]._id, 'test-2', 'returns couchdb response')
})

test('api docs teardown', async t => {
  await api.destroyDatabase(process.env.TEST_DATABASE_NAME)
})
