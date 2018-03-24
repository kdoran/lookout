import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import Pagination from 'components/Pagination'
import {Link} from 'react-router-dom'
import {getParams} from 'utils/utils'

const LIMIT = 500

export default class extends React.Component {
  constructor (props) {
    super(props)
    const { match: { params: { dbName } } } = this.props
    this.state = { dbName, loaded: false, rows: null, error: null }
  }

  componentDidMount () {
    this.fetch(this.props)
  }

  componentWillReceiveProps (newProps) {
    this.fetch(newProps)
  }

  fetch = (props) => {
    const { location: { search } } = props
    const offset = getParams(search).offset || 0
    const {dbName} = this.state
    this.setState({ loaded: false }, () => {
      fetcher.get(dbName + '/_all_docs', { skip: offset, limit: LIMIT }).then(response => {
        this.setState({ response, loaded: true })
      }).catch(error => this.setState({ error, loaded: true }))
    })
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
                      <td><Link to={dbName + '/' + row.id}>{row.id}</Link></td>
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
