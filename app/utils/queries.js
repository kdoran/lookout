export function getAllQueries (dbUrl) {
  return {
    'id-regex': {
      fetchParams: {
        url: `${dbUrl}_find`,
        method: 'POST',
        body: {
          selector: { _id: { '$regex': '' } },
          limit: 200
        }
      },
      fn: function parse (response) {
        // tip: chrome dev tools, right-click on logged object, store as global variable
        console.log(response)
        // limit doc length to display so we don't crash the browser
        return Object.assign({}, response, { docs: response.docs.slice(0, 50) })
      },
      startRow: 6,
      startColumn: 19
    },
    'all-docs': {
      fetchParams: {
        url: `${dbUrl}_all_docs`,
        method: 'GET',
        params: {
          limit: 500,
          include_docs: true
        }
      },
      fn: function parse (response) {
        // tip: chrome dev tools, right-click on logged object, store as global variable
        console.log(response)
        // limit doc length to display so we don't crash the browser
        return Object.assign({}, response, { docs: response.rows.slice(0, 50) })
      },
      startRow: 5,
      startColumn: 25
    },
    '_changes': {
      fetchParams: {
        url: `${dbUrl}_changes`,
        method: 'GET',
        params: {
          limit: 200,
          include_docs: true,
          descending: true
        }
      },
      fn: function parse (response) {
        // tip: chrome dev tools, right-click on logged object, store as global variable
        console.log(response)
        // limit doc length to display so we don't crash the browser
        return Object.assign({}, response, { results: response.results.slice(0, 20) })
      },
      startRow: 5,
      startColumn: 25
    },
    'conflicts': {
      fetchParams: {
        url: `${dbUrl}_all_docs`,
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
      startRow: 5,
      startColumn: 25
    }
  }
}

export function getQuery (dbUrl, queryName) {
  const queries = getAllQueries(dbUrl)
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
