import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Editor from 'components/Editor'
import Error from 'components/Error'
import Pagination from 'components/Pagination'
import AllowEditButton from 'components/AllowEditButton'
import Breadcrumbs from 'components/Breadcrumbs'
import DeleteDatabaseContainer from 'containers/DeleteDatabaseContainer'
import { Link } from 'react-router-dom'

import './docs-container.css'

const LIMIT = 500

export default class extends React.Component {
  state = {
    loaded: false,
    rows: null,
    error: null,
    showDeleteModal: false,
    viewFunc: '',
    editView: true
  }

  async componentDidMount () {
    const { dbName, couchUrl, searchParams: { offset = 0 }, match } = this.props
    this.setState({ loaded: false })
    try {
      const options = { skip: offset, limit: LIMIT }
      const url = `${couchUrl + dbName + '/_design/' + match.params.designId}`
      const response = await fetcher.get(url, options)
      this.setState({ response, loaded: true })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  onEdit = () => {

  }

  onEditViewFunc = (viewFunc) => {
    this.setState({
      viewFunc,
      editView: true
    })
  }

  render () {
    const { location: { pathname }, history } = this.props
    const { dbName, couchUrl, couch, searchParams: { offset = 0 } } = this.props
    const { loaded, error, response, showDeleteModal, editView, viewFunc } = this.state

    return (
      <div>
        <Breadcrumbs couch={couch} dbName={dbName} />
        {error && <Error error={error} />}
        {!error && !loaded && (<Loading />)}
        {!error && loaded && (
          <div>
            <section className='docs-controls'>
              <div>
                <Link to={`/${couch}/${dbName}/query/`}>query</Link> &nbsp;
                <AllowEditButton
                  dbName={dbName}
                  couchUrl={couchUrl}
                  onConfirm={() => history.push(`/${couch}/${dbName}/editing/new`)}
                >
                  new view
                </AllowEditButton>
              </div>
            </section>
            <table>
              <thead>
                <tr>
                  <th>name</th>
                  <th>rev</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(response.views).map(row => {
                  return (
                    <tr key={row}>
                      <td>{row}</td>
                      <td>
                        <button
                          onClick={() => this.onEditViewFunc(response.views[row].map)}
                        >View </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div> {
              editView && (
                <Editor
                  onChange={this.onEdit}
                  value={viewFunc}
                  height='50%'
                  mode={'javascript'}
                />
              )
            }

            </div>
            <section className='docs-controls'>
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
