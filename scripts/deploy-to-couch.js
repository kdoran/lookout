const fs = require('fs')
const parseArgs = require('minimist')
const axios = require('axios')

const BUILD_PATH = './dist/'

postDocs(parseArgs(process.argv.slice(2)))

async function postDocs ({
  couchUrl = 'http://localhost:5984/',
  databaseName = 'lookout',
  username = process.env.SCRIPT_USER || 'admin',
  password = process.env.SCRIPT_PASS || 'admin'
}) {
  const url = `${couchUrl}${databaseName}/lookout`
  const auth = {username, password}
  const _rev = await getRev(url, auth)
  const doc = {
    _id: 'lookout',
    _rev,
    _attachments: {
      'index.html': {
        content_type: `text\/html`, // eslint-disable-line
        data: getBase64File('index.html')
      },
      'lookout.js': {
        content_type: `text\/javascript`, // eslint-disable-line
        data: getBase64File('lookout.js')
      }
    }
  }
  try {
    const {data} = await axios.put(url, doc, {auth})
    console.log(data)
  } catch (error) {
    const {status, statusText, data} = error.response
    console.log(status, statusText, data)
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

function getBase64File (fileName) {
  const file = fs.readFileSync(`${BUILD_PATH}/${fileName}`)
  return file.toString('base64')
}
