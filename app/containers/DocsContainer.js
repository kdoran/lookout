import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import Pagination from 'components/Pagination'
import { Link } from 'react-router-dom'
import { getParams, getCouchUrl } from 'utils/utils'

const LIMIT = 500

export default class extends React.Component {
  constructor (props) {
    super(props)
    const { dbName, couchUrl } = getCouchUrl(props.match)
    this.state = {
      dbName,
      couchUrl,
      loaded: false,
      rows: null,
      error: null
    }
  }

  componentDidMount () {
    this.fetchIds(this.props)
  }

  componentWillReceiveProps (newProps) {
    this.fetchIds(newProps)
  }

  fetchIds = async props => {
    const { location: { search } } = props
    const offset = getParams(search).offset || 0
    const { dbName, couchUrl } = this.state
    this.setState({ loaded: false })
    try {
      const options = { skip: offset, limit: LIMIT }
      const response = await fetcher.dbGet(couchUrl, dbName, '_all_docs', options)
      this.setState({ response, loaded: true })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  render () {
    const { loaded, error, response, dbName } = this.state
    const { location: { pathname, search } } = this.props
    const offset = getParams(search).offset || 0
    return (
      <div>
        <h1>{dbName}</h1>
        {loaded ? error ? <Error error={error} /> : (
          <div>
            <div>
              <Pagination
                total={response.total_rows}
                displayed={response.rows.length}
                path={pathname}
                limit={LIMIT}
                offset={offset}
              />
            </div>
            <table>
              <thead>
                <tr>
                  <th>id</th>
                  <th>rev</th>
                </tr>
              </thead>
              <tbody>
                {response.rows.map(row => {
                  return (
                    <tr key={row.id}>
                      <td><Link to={dbName + '/' + encodeURIComponent(row.id) + '/'}>{row.id}</Link></td>
                      <td>{row.value.rev}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (<Loading />)}
      </div>
    )
  }
}
