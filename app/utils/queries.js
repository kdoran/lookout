function getAllQueries (dbName) {
  return {
    'id-regex': {
      fetchParams: {
        url: `${dbName}/_find`,
        method: 'POST',
        body: {
          selector: { _id: { '$regex': '' } },
          limit: Number.MAX_SAFE_INTEGER
        }
      },
      fn: function parse (response) {
        return response.docs
      },
      startRow: 6,
      startColumn: 19
    },
    'id-regex-ids-only': {
      fetchParams: {
        url: `${dbName}/_find`,
        method: 'POST',
        body: {
          selector: { _id: { '$regex': '' } },
          fields: ['_id'],
          limit: Number.MAX_SAFE_INTEGER
        }
      },
      fn: function parse (response) {
        return response.docs
      },
      startRow: 6,
      startColumn: 19
    },
    'all-docs': {
      fetchParams: {
        url: `${dbName}/_all_docs`,
        method: 'GET',
        params: {
          limit: Number.MAX_SAFE_INTEGER,
          include_docs: true
        }
      },
      fn: function parse (response) {
        return response.rows.map(row => row.doc)
      },
      startRow: 5,
      startColumn: 25
    },
    '_changes': {
      fetchParams: {
        url: `${dbName}/_changes`,
        method: 'GET',
        params: {
          limit: 10,
          include_docs: false,
          descending: true
        }
      },
      fn: function parse (response) {
        /* _changes endpoint in couchdb is not what you might expect, it is for syncing.
        It does not return a list of historical changes to the database, results are unique on doc id.
        since param is exclusive and it does not work with descending: true.
        revs aren't a list of revs that have changed since zero.
        `_deleted` docs do appear, but you don't see what they were before deleted.
        it's more like _latest_sequences than _changes, unless you're listening to it.
        https://gist.github.com/nolanlawson/44385bb80990077c30de
        https://docs.couchdb.org/en/3.0.0/api/database/changes.html */
        return response.results
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
          limit: Number.MAX_SAFE_INTEGER
        }
      },
      fn: function parse (response) {
        return response.docs
      },
      startRow: 6,
      startColumn: 19
    },
    'keys': {
      fetchParams: {
        url: `${dbName}/_all_docs?include_docs=true&limit=${Number.MAX_SAFE_INTEGER}`,
        method: 'POST',
        body: {
          keys: []
        }
      },
      fn: function parse (response) {
        return response.rows.map(row => row.doc)
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
      fn: function parse (results) {
        return results
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
          limit: Number.MAX_SAFE_INTEGER
        }
      },
      fn: function parse (response) {
        return response.docs
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
