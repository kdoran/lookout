/* global TextDecoder */

const fetch = window.fetch

const defaultOptions = {
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include'
}

export default {
  fetch (options) {
    if (options.method && options.method.toLowerCase() === 'get') {
      return this.get(options.url, options.params)
    }
    return fetch(options.url, {
      ...defaultOptions,
      ...options,
      body: JSON.stringify(options.body)
    })
      .then(parseJSON)
      .catch(throwParsedError)
  },

  get (url, params) {
    const urlMaybeWithParams = (params) ? `${url}?${getParams(params)}` : url
    return fetch(urlMaybeWithParams, defaultOptions)
      .then(parseJSON)
      .catch(throwParsedError)
  },

  dbGet (couchUrl, dbName, resource, params) {
    const url = `${couchUrl}${dbName}/${resource}`
    return this.get(url, params)
  },

  post (url, data = {}, method = 'POST') {
    const options = {
      ...defaultOptions,
      method,
      body: JSON.stringify(data)
    }
    return fetch(url, options)
      .then(parseJSON)
      .catch(throwParsedError)
  },

  put (resource, data = {}) {
    return this.post(resource, data, 'PUT')
  },

  dbPut (couchUrl, dbName, resource, doc) {
    const url = `${couchUrl}${dbName}/${resource}`
    return this.put(url, doc)
  },

  checkSession (url) {
    return fetch(url + '_session', { ...defaultOptions, method: 'GET' })
      .then(parseJSON)
      .catch(throwParsedError)
  },

  login (coucuUrl, username, password) {
    return this.post(coucuUrl + '_session', {username, password})
  },

  destroy (url) {
    return fetch(url, {
      ...defaultOptions,
      method: 'DELETE'
    }).then(parseJSON)
  },

  destroySession (couchUrl) {
    return this.destroy(couchUrl + '_session').then(() => {
      window.location.reload()
    })
  },

  getDesignDoc (dbName, designDocName) {
    const searchParams = getParams({
      reduce: false,
      descending: true
    })
    return this.get(`${dbName}/_design/${designDocName}/_view/${designDocName}?${searchParams}`)
  },

  getMultipart (url, params) {
    if (params) url = `${url}?${getParams(params)}`
    return fetch(url, defaultOptions).then(response => {
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
    }).catch(throwParsedError)
  }
}

async function parseJSON (resp) {
  let json = await resp.json()
  if (resp.status >= 200 && resp.status < 400) {
    return json
  } else {
    return Promise.reject(json)
  }
}

function throwParsedError (throwParsedError) {
  let errorString
  if (Object.keys(throwParsedError).length) {
    errorString = Object.keys(throwParsedError).map(key => (` ${key}: ${throwParsedError[key]}`)).join(' ')
  } else {
    errorString = throwParsedError.toString()
  }
  return Promise.reject(new Error(errorString))
}

function getParams (data) {
  return Object.keys(data).map(key => [key, data[key]].map(encodeURIComponent).join('=')).join('&')
}
