const React = require('react')
const {Link} = require('react-router-dom')
const {
  Editor,
  Loading,
  ErrorDisplay,
  Breadcrumbs,
  AllowEditButton
} = require('../components')

const {
  getQuery,
  getAllQueries,
  copyTextToClipboard,
  encode,
  decode,
  downloadJSON
} = require('../utils')

const RENDER_LIMIT = 500000
let resultsLength = 1

class QueryContainer extends React.Component {
  state = {
    loading: false,
    valid: true,
    result: null,
    error: null,
    response: null,
    input: undefined,
    setup: false
  }

  componentDidMount () {
    this.setupQuery()
  }

  componentDidUpdate (prevProps) {
    const {queryId, queryString} = this.props.match.params
    // console.log(queryId, queryString)
    if (queryId !== prevProps.match.params.queryId || queryString !== prevProps.match.params.queryString) {
      this.setupQuery()
    }
  }

  setupQuery () {
    const { queryId = 'id-regex', queryString } = this.props.match.params
    const queries = getAllQueries(this.props.dbUrl)
    const query = getQuery(this.props.dbName, queryId)
    const input = queryString
      ? decode(queryString)
      : query.string
    this.setState({queries, queryId, query, input, setup: true})
  }

  onEdit = async (input) => {
    this.setState({ input, error: '' })
  }

  run = async () => {
    const { valid, input } = this.state

    if (!valid) return

    this.setState({ loading: true, result: null })

    let parsedInput
    try {
      parsedInput = new Function(input + '; return {fetchParams, parse}')() // eslint-disable-line
    } catch (error) {
      this.setState({ error: error.message, loading: false })
      return
    }

    const { fetchParams, parse } = parsedInput
    let {url} = fetchParams
    delete fetchParams.url
    if (fetchParams.params) {
      url = `${url}?${getParams(fetchParams.params)}`
    } else {
      fetchParams.body = JSON.stringify(fetchParams.body)
    }
    try {
      const response = await this.props.api.fetcher(url, fetchParams)
      const result = parse(response)

      const varName = `r${resultsLength}`
      window[varName] = result
      resultsLength++
      console.log(`restuls available on variable ${varName}`, result)

      this.setState({ response, result, loading: false })
    } catch (error) {
      this.setState({ error, loading: false })
      console.error(error)
    }
  }

  copy = e => {
    e.preventDefault()
    copyTextToClipboard(JSON.stringify(this.state.response, null, 2))
  }

  download = () => {
    const { dbName, couch } = this.props
    const { queryId } = this.state
    downloadJSON(this.state.response, `${couch} ${dbName} ${queryId}`)
  }

  getUrl = async e => {
    e.preventDefault()
    const { input } = this.state
    const param = await encode(input)
    const currUrl = window.location.href.split('/query')[0]
    copyTextToClipboard(`${currUrl}/query/custom/${param}`)
  }

  // TODO: move to api or smth
  handleConfirmDelete = async () => {
    this.download()
    const {response} = this.state
    const originalDocs = response.docs || response.rows.map(row => row.doc)
    const docs = originalDocs.map(doc => ({
      _id: doc._id,
      _rev: doc._rev,
      _deleted: true
    }))
    if (!docs.length || docs.find(d => (!d._id || !d._rev))) {
      throw new Error(
        `Docs, ids, or revs not found in response.docs, aborting delete. ${docs}`
      )
    }
    const {dbName} = this.props
    const body = JSON.stringify({docs})
    const deleteResponse = await this.props.api.fetcher(`${dbName}/_bulk_docs`, {method: 'POST', body})
    console.log(`deleted docs response`, deleteResponse)
    const errorsFound = deleteResponse.filter(r => !r.ok || r.error)
    if (errorsFound.length) {
      console.error(`Errors found when trying to delete docs!`, errorsFound)
    }
  }

  render () {
    const { dbName, couch, couchUrl } = this.props
    const { query, queryId, queries, error, input, valid, loading, result, setup } = this.state

    if (!setup) return null

    const resultsLength = result && result.length !== undefined
      ? result.length
      : null

    let displayedResults = JSON.stringify(result, null, 2)
    let warning
    if (displayedResults.length > RENDER_LIMIT) {
      warning = 'Response too large to render, see console for results.'
      displayedResults = ''

      if (resultsLength) {
        displayedResults = JSON.stringify(result.slice(0,10), null, 2)
        warning += ' Previwing first 10 rows.'
      }
    }

    const links = Object.keys(queries).map(query => (
      <span key={query}>
        <span><Link to={`/${couch}/${dbName}/query/${query}`}>{query}</Link> </span>
      </span>
    ))
    return (
      <div>
        <Breadcrumbs couch={couch} dbName={dbName} docId={'query'} final={queryId} />

        {valid
          ? <a href='#' onClick={e => {e.preventDefault(); this.run()}}>run (cmd + enter or ctrl + enter)</a>
          : 'waiting for valid json'
        }
        <Editor
          onChange={this.onEdit}
          value={input}
          height='40%'
          onCmdEnter={this.run}
          startRow={query.startRow}
          startColumn={query.startColumn}
          mode={'javascript'}
        />
        {error && <ErrorDisplay error={error} />}
        queries: {links}
        <br /><br />
        {loading
          ? <Loading />
          : result &&
            <div>
              <section className='docs-controls'>
                {resultsLength !== undefined && <span>length: {resultsLength}</span>}
                <a href='' onClick={this.copy}>copy response to clipboard</a>
                <a href='' onClick={e => {e.preventDefault(); this.download()}}>download response</a>
                <a href='' onClick={this.getUrl}>copy sharable url to clipboard</a>
                <AllowEditButton
                  dbName={dbName}
                  type='link'
                  couchUrl={couchUrl}
                  onConfirm={this.handleConfirmDelete}
                  infoMessage={`
                      This will {_deleted: true} 'docs' found in the
                      response object (not the results of your 'parse' function!).
                      It downloads them first, keep that as your backup as couch
                      revisions are not guaranteed to stick around.
                    `}
                >
                  delete response
                </AllowEditButton>
              </section>
              {warning && <div className='warning'>{warning}</div>}
              <pre>
                {displayedResults}
              </pre>
            </div>
        }
      </div>
    )
  }
}

function getParams (data) {
  return Object.keys(data).map(key => [key, data[key]].map(encodeURIComponent).join('=')).join('&')
}

module.exports = {QueryContainer}
