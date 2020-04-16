const DEFAULT_LIMIT = 2000
const DEFAULT_LARGE_LIMIT = 50000000

function getAllQueries (dbName) {
  return {
    'id-regex': {
      fetchParams: {
        url: `${dbName}/_find`,
        method: 'POST',
        body: {
          selector: { _id: { '$regex': '' } },
          limit: DEFAULT_LIMIT
        }
      },
      fn: function parse (response) {
        // tip: chrome dev tools, right-click on logged object, store as global variable
        const docs = response.docs
        console.log(docs)
        // tip: if crashing your browser with large response results, return null
        // and look in the console instead
        return docs
      },
      startRow: 6,
      startColumn: 19
    },
    'id-regex-console': {
      fetchParams: {
        url: `${dbName}/_find`,
        method: 'POST',
        body: {
          selector: { _id: { '$regex': '' } },
          limit: DEFAULT_LARGE_LIMIT
        }
      },
      fn: function parse (response) {
        // tip: chrome dev tools, right-click on logged object, store as global variable
        const docs = response.docs
        console.log(docs)
      },
      startRow: 6,
      startColumn: 19
    },
    'all-docs': {
      fetchParams: {
        url: `${dbName}/_all_docs`,
        method: 'GET',
        params: {
          limit: DEFAULT_LIMIT,
          include_docs: true
        }
      },
      fn: function parse (response) {
        // tip: chrome dev tools, right-click on logged object, store as global variable
        const docs = response.rows.map(row => row.doc)
        console.log(docs)
        // tip: if crashing your browser with large response results, return null
        // and look in the console instead
        return docs
      },
      startRow: 5,
      startColumn: 25
    },
    '_changes': {
      fetchParams: {
        url: `${dbName}/_changes`,
        method: 'GET',
        params: {
          limit: DEFAULT_LIMIT,
          include_docs: true,
          descending: true
        }
      },
      fn: function parse (response) {
        // tip: chrome dev tools, right-click on logged object, store as global variable
        const changes = response.results
        console.log(changes)
        // tip: if crashing your browser with large response results, return null
        // and look in the console instead
        return changes
      },
      startRow: 5,
      startColumn: 25
    },
    'conflicts': {
      fetchParams: {
        url: `${dbName}/_find`,
        method: 'POST',
        body: {
          selector: { _conflicts: { '$exists': true } },
          conflicts: true,
          fields: ['_id', '_conflicts'],
          limit: DEFAULT_LARGE_LIMIT
        }
      },
      fn: function parse (response) {
        // tip: chrome dev tools, right-click on logged object, store as global variable
        const docs = response.docs
        console.log(docs)
        // tip: if crashing your browser with large response results, return null
        // and look in the console instead
        return `number conflicts found: ${docs.length}`
      },
      startRow: 6,
      startColumn: 19
    },
    'keys-search': {
      fetchParams: {
        url: `${dbName}/_all_docs?include_docs=true&limit=${DEFAULT_LIMIT}`,
        method: 'POST',
        body: {
          keys: []
        }
      },
      fn: function parse (response) {
        // tip: chrome dev tools, right-click on logged object, store as global variable
        const docs = response.rows.map(row => row.doc)
        console.log(docs)
        // tip: if crashing your browser with large response results, return null
        // and look in the console instead
        return docs
      },
      startRow: 5,
      startColumn: 25
    },
    'bulk-docs': {
      fetchParams: {
        url: `${dbName}/_bulk_docs`,
        method: 'POST',
        body: {
          docs: []
        }
      },
      fn: function parse (response) {
        // tip: chrome dev tools, right-click on logged object, store as global variable
        console.log(response)
        // tip: if crashing your browser with large response results, return null
        // and look in the console instead
        return response
      },
      startRow: 5,
      startColumn: 25
    },
    'and': {
      fetchParams: {
        url: `${dbName}/_find`,
        method: 'POST',
        body: {
          selector: {
            '$and': [
              {
                status: {
                  '$eq': 'accepted'
                }
              },
              {
                programId: {
                  '$eq': 'program:hiv-aids'
                }
              }
            ]
          },
          limit: DEFAULT_LIMIT
        }
      },
      fn: function parse (response) {
        // tip: chrome dev tools, right-click on logged object, store as global variable
        const docs = response.docs
        console.log(docs)
        // tip: if crashing your browser with large response results, return null
        // and look in the console instead
        return docs
      },
      startRow: 6,
      startColumn: 19
    }
  }
}

function getQuery (dbName, queryName) {
  const queries = getAllQueries(dbName)
  if (!queries[queryName]) {
    return `${queryName} not found`
  }
  const string = `const fetchParams = ${JSON.stringify(queries[queryName].fetchParams, null, 2)}

${queries[queryName].fn.toString().replace(/ {6}/g, '')}
`
  return {
    string,
    ...queries[queryName]
  }
}

module.exports = {getAllQueries, getQuery}
