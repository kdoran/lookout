import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import Pagination from 'components/Pagination'
import AllowEditButton from 'components/AllowEditButton'
import DeleteDatabaseContainer from 'containers/DeleteDatabaseContainer'
import { Link } from 'react-router-dom'
import { getParams, getCouchUrl } from 'utils/utils'

import './docs-container.css'

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
      error: null,
      showDeleteModal: false
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
    const { loaded, error, response, dbName, couchUrl, showDeleteModal } = this.state
    const { location: { pathname, search }, history } = this.props
    const { params: { couch } } = this.props.match
    const offset = getParams(search).offset || 0
    const PaginationComponent = () => (
      <Pagination
        total={response.total_rows}
        displayed={response.rows.length}
        path={pathname}
        limit={LIMIT}
        offset={offset}
      />
    )
    return (
      <div>
        <h1>{dbName}</h1>
        {error && <Error error={error} />}
        {!error && !loaded && (<Loading />)}
        {!error && loaded && (
          <div>
            <section className='docs-controls'>
              <PaginationComponent />
              <AllowEditButton
                dbName={dbName}
                couchUrl={couchUrl}
                onConfirm={() => history.push(`/${couch}/${dbName}/editing/new`)}
              >
                new document
              </AllowEditButton>
            </section>
            {offset === 0 && (<span><Link to={dbName + '/_security'}>_security</Link><br /><br /></span>)}
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
                      <td><Link to={`/${couch}/${dbName}/${row.id}`}>{row.id}</Link></td>
                      <td>{row.value.rev}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <section className='docs-controls'>
              {response.rows.length > 20 && (
                <PaginationComponent />
              )}
              <AllowEditButton
                couchUrl={couchUrl}
                dbName={dbName}
                onConfirm={() => this.setState({ showDeleteModal: true })}
                >
                Delete Database
              </AllowEditButton>
              <DeleteDatabaseContainer
                couchUrl={couchUrl}
                dbName={dbName}
                history={history}
                couch={this.props.match.params.couch}
                onClose={() => this.setState({ showDeleteModal: false })}
                show={showDeleteModal}
              />
            </section>
          </div>
        )}
      </div>
    )
  }
}
