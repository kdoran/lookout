import React from 'react'
import Loading from 'components/Loading'
import Pagination from 'components/Pagination'
import AllowEditButton from 'components/AllowEditButton'
import Breadcrumbs from 'components/Breadcrumbs'
import DeleteDatabaseContainer from 'containers/DeleteDatabaseContainer'
import {Link} from 'react-router-dom'

import './docs-container.css'

const LIMIT = 500

export default class extends React.Component {
  state = {
    loaded: false,
    rows: null,
    showDeleteModal: false
  }

  async componentDidMount () {
    const {api, searchParams: {offset = 0}} = this.props
    this.setState({ loaded: false })
    const options = {skip: offset, limit: LIMIT}
    let {count, rows} = await api.base.listIds(options)
    rows = rows.map(row => {
      const link = (row.id.indexOf('/') === -1)
        ? row.id
        : encodeURIComponent(row.id)
      return { ...row, link }
    })
    this.setState({ count, rows, loaded: true })
  }

  render () {
    const { location: { pathname }, history } = this.props
    const { dbName, couchUrl, couch, searchParams: { offset = 0 } } = this.props
    const { loaded, rows, count, showDeleteModal } = this.state

    const PaginationComponent = () => (
      <Pagination
        total={count}
        displayed={rows.length}
        path={pathname}
        limit={LIMIT}
        offset={offset}
      />
    )
    return (
      <div>
        <Breadcrumbs couch={couch} dbName={dbName} />
        {!loaded && (<Loading />)}
        {loaded && (
          <div>
            <section className='docs-controls'>
              <PaginationComponent />
              <div>
                <Link to={`/${couch}/${dbName}/query/`}>query</Link> &nbsp;
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
              {rows.length > 20 && (
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
