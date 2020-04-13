/* global btoa */
const isomorphicFetch = require('isomorphic-fetch')

function getFetch ({url, username, password, fetch = isomorphicFetch}) {
  if (!url) {
    throw new Error(`getFetch URL required`)
  }

  async function fetcher (endpoint, params) {
    const config = {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      ...params
    }
    if (username && password) {
      config.headers['Authorization'] = `Basic ${btoa(`${username}:${password}`)}`
      delete config.credentials
    }

    const urlWithSlash = url.endsWith('/')
      ? url
      : `${url}/`

    const response = await fetch(`${urlWithSlash}${endpoint}`, config)
    let body
    try {
      body = await response.json()
    } catch (e) {
      console.warn('error caught in fetch parsing body')
    }
    if (!response.ok) {
      const error = new Error()
      Object.assign(error, {status: response.status, statusText: response.statusText}, body)
      throw error
    }
    return body
  }

  return fetcher
}

module.exports = {getFetch}
