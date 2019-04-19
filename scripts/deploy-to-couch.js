const fs = require('fs')
const parseArgs = require('minimist')
const prompts = require('prompts')
const axios = require('axios')

const BUILD_PATH = './dist/'

postDocs(parseArgs(process.argv.slice(2)))

async function postDocs ({
  couchUrl = 'http://localhost:5984/',
  databaseName = 'lookout',
  username = process.env.SCRIPT_USER || 'admin',
  password = process.env.SCRIPT_PASS || 'admin'
}) {
  const dbUrl = `${couchUrl}${databaseName}`
  const docUrl = `${dbUrl}/lookout`
  const {value: responseValue} = await prompts({
    type: 'confirm',
    name: 'value',
    message: `Did you run npm build first? Deploy to ${docUrl}?`,
    initial: false
  })
  if (!responseValue) return
  const auth = {username, password}
  await createDB(dbUrl, auth)
  const _rev = await getRev(docUrl, auth)
  const doc = createDoc(_rev, BUILD_PATH)
  try {
    const {data} = await axios.put(docUrl, doc, {auth})
    console.log(data)
    console.log(`\nlookout should be accessible at \n\n${docUrl}/index.html#/\n\n`)
  } catch (error) {
    const {status, statusText, data} = error.response
    console.log(status, statusText, data)
  }
}

async function createDB (url, auth) {
  try {
    const {status, statusText, data} = await axios.put(url, {}, {auth})
  } catch (error) {
    const {status, statusText, data} = error.response
    // this is fine
    if (data.error.includes('exists')) return

    console.log('error creating DB', status, statusText, data)
  }
}

async function getRev (url, auth) {
  try {
    const {data: {_rev}} = await axios.get(url, {auth})
    return _rev
  } catch (error) {
    console.log('no existing doc found.')
  }
}

function createDoc (_rev, path) {
  return {
    _id: 'lookout',
    _rev,
    _attachments: {
      'index.html': {
        content_type: `text\/html`, // eslint-disable-line
        data: getBase64File(`${path}index.html`)
      },
      'lookout.js': {
        content_type: `text\/javascript`, // eslint-disable-line
        data: getBase64File(`${path}lookout.js`)
      }
    }
  }
}

function getBase64File (filePath) {
  const file = fs.readFileSync(filePath)
  return file.toString('base64')
}