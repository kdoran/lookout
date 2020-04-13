import React from 'react'
import Loading from 'components/Loading'
import Error from 'components/Error'
import Pagination from 'components/Pagination'
import AllowEditButton from 'components/AllowEditButton'
import Breadcrumbs from 'components/Breadcrumbs'
import DeleteDatabaseModal from 'components/DeleteDatabaseModal'
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

  componentDidMount () {
    this.load()
  }

  componentDidUpdate (prevProps) {
    const {dbUrl, searchParams: {offset}} = this.props
    if (prevProps.dbUrl !== dbUrl || prevProps.searchParams.offset !== offset) {
      this.load()
    }
  }

  load = async () => {
    const { dbName, couchUrl, searchParams: { offset = 0 } } = this.props
    this.setState({ loaded: false })

    try {
      const options = { skip: offset, limit: LIMIT, include_docs: false }
      const response = await this.props.pouchDB.allDocs(options)
      const rows = response.rows.map(row => {
        const link = (row.id.indexOf('/') === -1)
          ? row.id
          : encodeURIComponent(row.id)
        return { ...row, link }
      })
      this.setState({ response, rows, loaded: true })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  onConfirmDeleteDatabase = async () => {
    const {couch, dbName} = this.props
    await this.props.api.destroyDatabase(dbName)
    window.alert(`Database ${dbName} deleted.`)
    this.props.history.push(`/${couch}`)
  }

  render () {
    const { location: { pathname }, history } = this.props
    const { dbName, couchUrl, couch, searchParams: { offset = 0 } } = this.props
    const { loaded, error, response, rows, showDeleteModal } = this.state

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
        <Breadcrumbs couch={couch} dbName={dbName} />
        {error && <Error error={error} />}
        {!error && !loaded && (<Loading />)}
        {!error && loaded && (
          <div>
            <section className='docs-controls'>
              <PaginationComponent />
              <div>
                <Link to={`/${couch}/${dbName}/query/`}>query</Link>
                <AllowEditButton
                  dbName={dbName}
                  couchUrl={couchUrl}
                  onConfirm={() => history.push(`/${couch}/${dbName}/new/editing`)}
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
                {rows.map(row => {
                  return (
                    <tr key={row.id}>
                      <td><Link to={`/${couch}/${dbName}/${row.link}`}>{row.id}</Link></td>
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
              <DeleteDatabaseModal
                couchUrl={couchUrl}
                dbName={dbName}
                onClose={() => this.setState({ showDeleteModal: false })}
                onConfirm={this.onConfirmDeleteDatabase}
                show={showDeleteModal}
              />
            </section>
          </div>
        )}
      </div>
    )
  }
}
