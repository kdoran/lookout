import ManyCouchApi from '@fielded/manycouch'

let cacheKey
let api

export default async function initApi (dbName, couchUrl) {
  const currentKey = `${couchUrl + dbName}`
  if (cacheKey === currentKey) return api

  if (api) {
    await api.close()
    api = null
    cacheKey = null
  }

  if (!dbName || !couchUrl) return

  api = new ManyCouchApi({dbName, type: 'remoteBrowser', url: couchUrl})
  cacheKey = currentKey
  return api
}
