import React from 'react'
import Editor from 'components/Editor'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import Breadcrumbs from 'components/Breadcrumbs'
import QueryResponse from 'components/QueryResponse'
import { getQuery, getAllQueries } from 'utils/queries'
import { copyTextToClipboard } from 'utils/utils'
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
    const { queryId = 'id-regex' } = nextProps.match.params
    const queries = getAllQueries(nextProps.dbUrl)
    const query = getQuery(nextProps.dbUrl, queryId)
    let input = prevState.input
    if (input === undefined) {
      input = query.string
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

  download = e => {
    e.preventDefault()
    const { dbName, couch } = this.props
    const { queryId } = this.state
    downloadJSON(this.state.response, `${couch} ${dbName} ${queryId}`)
  }

  render () {
    const { dbName, couch } = this.props
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
        <a href='' onClick={this.copy}>copy response to clipboard</a> <a href='' onClick={this.download}>download response</a>
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
