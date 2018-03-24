/* global fetch, TextDecoder */

const noCredentialsOptions = {
  headers: { 'Content-Type': 'application/json' }
}

const options = {
  ...noCredentialsOptions,
  credentials: 'include'
}

let couchDbUrl = ''

export default {

  init (url) {
    return fetch(url + '_session', { ...options, method: 'GET' }).then(parseJSON).then(user => {
      couchDbUrl = url
      return user
    }).catch(fetchError)
  },

  get (resource, params) {
    let url = couchDbUrl + resource
    if (params) url = `${url}?${getParams(params)}`
    return fetch(url, options)
      .then(parseJSON).catch(fetchError)
  },

  post (resource, data = {}, method = 'POST') {
    return fetch(couchDbUrl + resource, {
      ...options,
      method,
      body: JSON.stringify(data)
    }).then(parseJSON).catch(fetchError)
  },

  put (url, data = {}) {
    return this.post(url, data, 'PUT')
  },

  login (username, password) {
    return this.post('_session', {username, password})
  },

  destroy (url) {
    return fetch(couchDbUrl + url, {
      ...options,
      method: 'DELETE'
    }).then(parseJSON)
  },

  destroySession () {
    return this.destroy('_session')
  },

  getDesignDoc (dbName, designDocName) {
    const searchParams = getParams({
      reduce: false,
      descending: true
    })
    return this.get(`${dbName}/_design/${designDocName}/_view/${designDocName}?${searchParams}`)
  },

  getMultipart (resource, params) {
    let url = couchDbUrl + resource
    if (params) url = `${url}?${getParams(params)}`
    return fetch(url, options).then(response => {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      return getLine()
      function getLine () {
        return reader.read().then(({value, done}) => {
          if (value) {
            text += decoder.decode(value, {stream: !done})
            return getLine()
          } else {
            // Split on the newline, each fourth line is our JSON, e.g.
            // --4b08b42f8ccb77cba04ddfe410ae8b15
            // Content-Type: application/json
            // [empty line]
            // [our json]
            const lines = text.split('\n')
            const revs = []
            lines.forEach((line, i) => {
              if ((i + 1) % 4 === 0) {
                const jsonRev = JSON.parse(line)
                revs.push(jsonRev)
              }
            })
            return revs
          }
        })
      }
    }).catch(fetchError)
  }
}

function parseJSON (httpResponse) {
  const { status } = httpResponse
  return httpResponse.json().then(response => {
    if (status >= 400) {
      return Promise.reject(JSON.stringify({ ...response, status }, null, 2))
    } else {
      return response
    }
  })
}

// Pretty sure only called if network connection refused,
// 400+ responses are not errors for fetch.
function fetchError (fetchError) {
  let error
  if (Object.keys(fetchError).length) {
    error = Object.keys(fetchError).map(key => (` ${key}: ${fetchError[key]}`)).join(' ')
  } else {
    error = fetchError.toString()
  }
  // error += ' Database server most likely could not be reached. If running locally please try to start CouchDB.'
  return Promise.reject(error)
}

function getParams (data) {
  return Object.keys(data).map(key => [key, data[key]].map(encodeURIComponent).join('=')).join('&')
}
