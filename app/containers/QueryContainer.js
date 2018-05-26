import React from 'react'
import Editor from 'components/Editor'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import QueryResponse from 'components/QueryResponse'
import { getCouchUrl } from 'utils/utils'
import { getQuery, getAllQueries } from 'utils/queries'
// import { Link } from 'react-router-dom'

export default class extends React.Component {
  constructor (props) {
    super(props)
    const { queryId } = props.match.params
    const { dbName, couchUrl, couch } = getCouchUrl(props.match)
    const baseUrl = `${couchUrl}${dbName}`
    const queries = getAllQueries(baseUrl)
    const query = getQuery(baseUrl, queryId)
    this.state = {
      dbName,
      couchUrl,
      couch,
      queryId,
      runOnStart: query.runOnStart,
      input: query.string,
      startRow: query.startRow,
      startColumn: query.startColumn,
      loading: false,
      valid: true,
      result: null,
      error: null,
      queries
    }
  }

  componentDidMount () {
    if (this.state.runOnStart) this.run()
  }

  onEdit = async (input) => {
    this.setState({ input, error: '' })
  }

  run = async event => {
    if (event) event.preventDefault()
    const { valid, input, couchUrl, dbName } = this.state
    if (!valid) return
    this.setState({ loading: true, result: null })
    let parsedInput
    try {
      parsedInput = new Function(input + '; return {fetchParams, parse}')()
    } catch (error) {
      this.setState({ error: 'syntax error', loading: false })
      return
    }
    const { fetchParams, parse } = parsedInput
    try {
      const response = await fetcher.fetch(fetchParams)
      const result = parse(response)
      this.setState({ result, loading: false })
    } catch (error) {
      this.setState({ error, loading: false })
      console.error(error)
    }
  }

  render () {
    const { dbName, queryId, queries, error, input, valid, loading, couch, result, startRow, startColumn } = this.state
    const links = Object.keys(queries).map(query => (
      <span key={query}>
        <a href={`/${couch}/${dbName}/query/${query}/`}>{query}</a>&nbsp;
      </span>
    ))
    return (
      <div>
        <h4>{dbName}: {queryId ? queryId : 'new query'}</h4>
        {valid
          ? <a href='#' onClick={this.run}>run (cmd + enter or ctrl + enter)</a>
          : 'waiting for valid json'
        }
        <Editor
          onChange={this.onEdit}
          value={input}
          height='40%'
          onCmdEnter={this.run}
          startRow={startRow}
          startColumn={startColumn}
          mode={'javascript'}
        />
        {error && <Error error={error} />}
        queries: {links}
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
