import React from 'react'
import Editor from 'components/Editor'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import Breadcrumbs from 'components/Breadcrumbs'
import QueryResponse from 'components/QueryResponse'
import AllowEditButton from 'components/AllowEditButton'
import { getQuery, getAllQueries } from 'utils/queries'
import { copyTextToClipboard } from 'utils/utils'
import { encode, decode } from 'utils/url-params'
import { Link } from 'react-router-dom'
import { downloadJSON } from 'utils/download'

export default class QueryContainer extends React.Component {
  state = {
    loading: false,
    valid: true,
    result: null,
    error: null,
    response: null,
    input: undefined
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const { queryId = 'id-regex', queryString } = nextProps.match.params
    const queries = getAllQueries(nextProps.dbUrl)
    const query = getQuery(nextProps.dbUrl, queryId)
    let input = prevState.input
    if (input === undefined) {
      input = queryString
        ? decode(queryString)
        : query.string
    }
    return { ...prevState, queries, queryId, query, input }
  }

  onEdit = async (input) => {
    this.setState({ input, error: '' })
  }

  run = async event => {
    if (event) event.preventDefault()
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
    try {
      const response = await fetcher.fetch(fetchParams)
      const result = parse(response)
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
    const {dbUrl} = this.props
    const deleteResponse = await fetcher.post(`${dbUrl}_bulk_docs`, {docs})
    console.log(`deleted docs response`, deleteResponse)
    const errorsFound = deleteResponse.filter(r => !r.ok)
    if (errorsFound.length) {
      console.error(`Errors found when trying to delete docs!`, errorsFound)
    }
  }

  render () {
    const { dbName, couch, couchUrl } = this.props
    const { query, queryId, queries, error, input, valid, loading, result } = this.state

    const links = Object.keys(queries).map(query => (
      <span key={query}>
        <Link to={`/${couch}/${dbName}/query/${query}`}>{query}</Link>&nbsp;
      </span>
    ))
    return (
      <div>
        <Breadcrumbs couch={couch} dbName={dbName} docId={'query'} final={queryId} />

        {valid
          ? <a href='#' onClick={this.run}>run (cmd + enter or ctrl + enter)</a>
          : 'waiting for valid json'
        }
        <Editor
          onChange={this.onEdit}
          value={input}
          height='50%'
          onCmdEnter={this.run}
          startRow={query.startRow}
          startColumn={query.startColumn}
          mode={'javascript'}
        />
        {error && <Error error={error} />}
        queries: {links}
        <br /><br />
        <a href='' onClick={this.copy}>copy response to clipboard</a>
        &nbsp; <a href='' onClick={e => {e.preventDefault(); this.download()}}>download response</a>
        &nbsp; <a href='' onClick={this.getUrl}>copy sharable url to clipboard</a>
        &nbsp;
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
        {loading
          ? <Loading />
          : result &&
            <QueryResponse
              result={result}
              dbName={dbName}
              couch={couch}
            />
        }
      </div>
    )
  }
}
