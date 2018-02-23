import fetch from 'isomorphic-fetch'
import {parseSnapshot} from './utils'

const backend = 'http://localhost:5984/'
const db = 'van-shipments'
const dbUrl = `${backend}${db}`

const options = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
}

export function checkAuth () {
  return fetch(`${backend}/_session`, options)
  .then(parseJSON)
}

export function login (name, password) {
  return fetch(`${backend}_session`, {
    ...options,
    method: 'POST',
    body: JSON.stringify({ name, password })
  })
}

export function getAllShipments () {
  const url = `${dbUrl}/_all_docs?${getParams({ include_docs: true })}`
  return fetch(`${url}`, options)
  .then(parseJSON).then(parseShipmentDocs)
}

function parseShipmentDocs(response) {
  const docHash = response.rows.map(row => row.doc)
    .reduce((memo, doc) => {
      if (doc._id.includes(':status:')) {
        const id = doc._id.split(':status:')[0]
        const [ , origin, , destination, , date, , no, , status, , agent] = doc._id.split(':')
        memo[id] = memo[id] || { id, docs: [], docTypes: { new: 0, 'pre-advice': 0, sent: 0, arrived: 0, received: 0, survey: 0, change: 0 }, origin, destination, date, no, status, agent }
        memo[id].docs.push(doc)
        const type = doc.type === 'snapshot' ? status : doc.type
        memo[id].docTypes[type] = memo[id].docTypes[type] ? memo[id].docTypes[type] + 1 : 1
        if (!memo[id].mostRecentTimestamp || memo[id].mostRecentTimestamp < doc.createdAt) {
          memo[id].mostRecentTimestamp = doc.createdAt
          memo[id].lastEditedBy = agent
        }
      }
      return memo
    }, {})
  const rows = Object.keys(docHash).map(id => (docHash[id]))
  rows.sort((a, b) => b.mostRecentTimestamp.localeCompare(a.mostRecentTimestamp))
  return rows
}

export function getShipmentDocs(snapshotId) {
  const params = {
    include_docs: true,
    start_key: `"${snapshotId}"`,
    end_key: `"${snapshotId}{}"`
  }
  const url = `${dbUrl}/_all_docs?${getParams(params)}`
  return fetch(`${url}`, { credentials: 'include' } )
  .then(parseJSON).then(response => response.rows.map(row => row.doc)
  )
}

export function getDoc(docId, database = 'van-shipments') {
  const url = `${backend}${database}/${docId}`
  return fetch(`${url}`, options).then(parseJSON)
}

export function deleteDocs(docs) {
  docs = docs.map(doc => {
    doc._deleted = true
    return doc
  })
  return fetch(`${dbUrl}/_bulk_docs`, {
    method: 'POST',
     ...options,
     body: JSON.stringify({ docs: docs })
   })
}

function parseJSON (httpResponse) {
  return httpResponse.json().then((response) => {
    if (httpResponse.status >= 400) {
      return Promise.reject(response)
    } else {
      return response
    }
  })
}

function getParams (data) {
  return Object.keys(data).map(key => [key, data[key]].join('=')).join('&')
}


// curl -X POST -d '{"user": {"location": {"id": "zone:ne"}}, "dbName": "van-shipments"}' https://em64x4rdt5.execute-api.eu-central-1.amazonaws.com/development/ids
export function getFilteredIds() {
  const user = {
      _id: 'org.couchdb.user:test',
      _rev: '1-57b863f4206c067576e5dfc8960d495a',
      name: 'test',
      type: 'user',
      roles: [
        'van-user',
        'role:national-dashboard-user'
      ],
      location: {
        id: 'national'
      },
      password_scheme: 'pbkdf2',
      iterations: 10,
      derived_key: 'f7fde9fe2fb441f405ebf532ea2fe67de53189f2',
      salt: '8a2c79863a75cea58de36acd7dd577fb'
    }
  const url = 'https://em64x4rdt5.execute-api.eu-central-1.amazonaws.com/development/ids'
  return fetch(url, {
    method: 'POST',
     // ...options,
     body: JSON.stringify({user: user, "dbName": "van-shipments"})
   }).then(parseJSON)
}


export function getIntegratedData (params = null) {
  // const params = { include_docs: true })
  let url = `${backend}integrated-data/_all_docs`
  if (params) url += `?${getParams(params)}`
  return fetch(`${url}`, options)
  .then(parseJSON).then(response => response.rows.map(row => ({ id: row.id, revCount: row.value.rev.split('-')[0]  })))
}
