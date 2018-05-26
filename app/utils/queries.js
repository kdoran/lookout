export function getAllQueries (baseUrl) {
  return {
    'id-regex': {
      fetchParams: {
        url: `${baseUrl}/_find`,
        method: 'POST',
        body: {
          selector: { _id: { '$regex': '' } },
          limit: 500
        }
      },
      fn: function parse (response) {
        return response
      },
      startRow: 6,
      startColumn: 19
    },
    'all-docs': {
      fetchParams: {
        url: `${baseUrl}/_all_docs`,
        method: 'GET',
        params: {
          limit: 500,
          include_docs: true
        }
      },
      fn: function parse (response) {
        return response
      },
      runOnStart: true,
      startRow: 5,
      startColumn: 25
    },
    'conflicts': {
      fetchParams: {
        url: `${baseUrl}/_all_docs`,
        method: 'GET',
        params: {
          include_docs: true,
          conflicts: true
        }
      },
      fn: function parse (response) {
        const docs = response.rows.filter(row => row.doc._conflicts)
        console.log(docs)
        return docs.length
      },
      runOnStart: true,
      startRow: 5,
      startColumn: 25
    }
  }
}

export function getQuery (baseUrl, queryName = 'id-regex') {
  const queries = getAllQueries(baseUrl)
  if (!queries[queryName]) {
    return `${queryName} not found`
  }
  const string = `const fetchParams = ${JSON.stringify(queries[queryName].fetchParams, null, 2)}

${queries[queryName].fn.toString().replace(/      /g, '')}
`
  return {
    string,
    ...queries[queryName]
  }
}
