const test = require('../../smalltest')
const {LookoutApi} = require('../../../app/lookout-api')

let api
test('lookout api: constructor', async t => {
  api = new LookoutApi()
  t.ok(api.couchLink.create, 'has a couch link api')
  t.notOk(api.couchServer, 'starts without a remote api')
  t.ok(api.setCouchServer, 'has a way to set the remote url')
  api.setCouchServer('http://localhost:5984/')
  t.ok(api.couchServer.login, 'has a remote api')
})
