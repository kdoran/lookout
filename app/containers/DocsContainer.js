import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import Pagination from 'components/Pagination'
import AllowEditButton from 'components/AllowEditButton'
import DeleteDatabaseContainer from 'containers/DeleteDatabaseContainer'
import { Link } from 'react-router-dom'

import './docs-container.css'

const LIMIT = 500

export default class extends React.Component {
  state = {
    loaded: false,
    rows: null,
    error: null,
    showDeleteModal: false
  }

  async componentDidMount () {
    const { dbName, couchUrl, searchParams: { offset = 0 } } = this.props
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
    const { location: { pathname, search }, history } = this.props
    const { dbName, couchUrl, couch, searchParams: { offset = 0 } } = this.props
    const { loaded, error, response, showDeleteModal } = this.state

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
              <div>
                <Link to={`/${couch}/${dbName}/query/`}>new query</Link> &nbsp;
                <AllowEditButton
                  dbName={dbName}
                  couchUrl={couchUrl}
                  onConfirm={() => history.push(`/${couch}/${dbName}/editing/new`)}
                >
                  new document
                </AllowEditButton>
              </div>
            </section>
            {offset === 0 && (<span><Link to={`/${couch}/${dbName}/_security`}>_security</Link><br /><br /></span>)}
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
                couch={couch}
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
