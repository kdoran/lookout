import React from 'react'
import Editor from 'components/Editor'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import QueryResponse from 'components/QueryResponse'
import { getQuery, getAllQueries } from 'utils/queries'
import { Link } from 'react-router-dom'

export default class extends React.Component {
  state = {
    loading: false,
    valid: true,
    result: null,
    error: null
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const { queryId = 'id-regex' } = nextProps.match.params
    const queries = getAllQueries(nextProps.dbUrl)
    const query = getQuery(nextProps.dbUrl, queryId)
    return { ...prevState, queries, queryId, query }
  }

  onEdit = async (input) => {
    this.setState({ input, error: '' })
  }

  run = async event => {
    const { couchUrl, dbName } = this.props
    const { valid, input } = this.state

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
    const { dbName, couch } = this.props
    const { query, queryId, queries, error, input, valid, loading, result, baseInput } = this.state

    const links = Object.keys(queries).map(query => (
      <span key={query}>
        <Link to={`/${couch}/${dbName}/query/${query}`}>{query}</Link>&nbsp;
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
          value={input || query.string}
          height='40%'
          onCmdEnter={this.run}
          startRow={query.startRow}
          startColumn={query.startColumn}
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
