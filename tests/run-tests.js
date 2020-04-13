const page = getPage()

function getPage () {
  const {search} = window.location

  if (!search || search === '?all') {
    return 'all'
  }

  if (search === '?remote') {
    return 'remote'
  }
  if (search === '?browser') {
    return 'browser'
  }

  if (search.startsWith('?testFile=')) {
    return search.replace('?testFile=', '')
  }

  return 'api'
}

const header = document.getElementById('page-header')
header.innerHTML = (page === 'api') ? 'api' : `Tests: ${page}`

function requireAll (r) { r.keys().forEach(r) }

if (page === 'all') {
  console.log('Running all tests')
  requireAll(require.context('./src/remote/', true, /-test\.js$/))
  requireAll(require.context('./src/browser/', true, /-test\.js$/))
} else if (page === 'remote') {
  console.log('Running just remote tests')
  requireAll(require.context('./src/remote/', true, /-test\.js$/))
} else if (page === 'browser') {
  console.log('Running just browser tests')
  requireAll(require.context('./src/browser/', true, /-test\.js$/))
} else if (page.startsWith('/')) {
  console.log('Running specific test: ', page)
  require(`./src${page}`)
} else {
  throw new Error('run tests could not figure out what to do with url')
}

// TODO: setup an api playground
// if (page == 'api') {
//   const {PouchDB, initApi} = require('./src')
//   window.PouchDB = PouchDB
//   window.api = initApi({
//     username: 'browser-testing',
//     entities: [
//       {entityType: 'form', databaseName: 'forms'}
//     ],
//     databaseConfigs: [
//       {databaseName: 'forms'}
//     ]
//   })
//
//   window.initApi = initApi
//   console.log(`
//     This page is for playing around with things in the console.
//     window.PouchDB is available, e.g. new PouchDB('test-db-name')
//
//     window.api is an initialized api instance, so things like await api.form.list() should work
//   `)
// }

const browserTests = require
  .context('./src/browser', true, /-test\.js$/).keys().map(key => `/browser${key}`)
const remoteTests = require.context('./src/remote', true, /-test\.js$/).keys().map(key => `/remote${key}`)

document.getElementById('content').innerHTML = `
  <h2>run specific tests</h2>
  <div>
    browser tests
    <ul>
      ${displayTests(browserTests)}
    </ul>
  </div>
  <div>
    remote tests
    <ul>
      ${displayTests(remoteTests)}
    </ul>
  </div>
`

function displayTests (testList) {
  return testList
    .map(tp => tp.replace('.', ''))
    .map(testPath => `<li><a href='?testFile=${testPath}'>${testPath}</a></li>`)
    .join('')
}
