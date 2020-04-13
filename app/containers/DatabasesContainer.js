import React from 'react'
import keyBy from 'lodash/keyBy'
import Loading from 'components/Loading'
import NewDatabaseModal from 'components/NewDatabaseModal'
import Error from 'components/Error'
import { Link } from 'react-router-dom'
import AllowEditButton from 'components/AllowEditButton'
import Breadcrumbs from 'components/Breadcrumbs'
import { showMBSize, withCommas } from 'utils/utils'

import './databases-container.css'

export default class extends React.Component {
  state = {
    loaded: false,
    error: null,
    infos: {},
    showNewDBModal: false,
    dbs: []
  }

  componentDidMount () {
    this.fetchInfos()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.couchUrl !== this.props.couchUrl)
    this.fetchInfos()
  }

  fetchInfos = async () => {
    // infos and dbs are split for couch < 2.2 that does not have
    // single infos call. lazy load dbs & display first
    // so you're not always waiting on the 100 individual info calls
    const dbs = await this.props.api.listDatabases()
    this.setState({dbs})
    const infosResponse = await this.props.api.listInfos(dbs)
    const infos = keyBy(infosResponse, 'key')
    this.setState({loaded: true, infos})
  }

  createDatabase = async (dbName) => {
    const {api, history, couch} = this.props
    try {
      await api.createDatabase(dbName)
      window.alert(`Created database ${dbName}`)
      history.push(`/${couch}/${dbName}`)
    } catch (error) {
      this.setState({ error })
    }
  }

  render () {
    const { couchUrl, couch, history } = this.props
    const { loaded, error, infos, dbs, showNewDBModal } = this.state

    return (
      <div>
        <Breadcrumbs couch={couch} />
        {loaded ? error ? <Error error={error} /> : (
          <div>
            <table>
              <thead>
                <tr>
                  <th>name</th>
                  <th />
                  <th>doc count</th>
                  <th>data size</th>
                  <th>disk space</th>
                  <th>deleted</th>
                  <th>seq no. (as int)</th>
                </tr>
              </thead>
              <tbody>
                {dbs.map(db => {
                  return (
                    <tr key={db}>
                      <td><Link to={`/${couch}/${db}/query`}>{db}</Link></td>
                      <td><Link to={`/${couch}/${db}/`}>all docs</Link></td>
                      <td>{infos[db] ? withCommas(infos[db].info.doc_count) : 'loading...'}</td>
                      <td>{infos[db] ? showMBSize(infos[db].info.data_size) : 'loading...'}</td>
                      <td>{infos[db] ? showMBSize(infos[db].info.disk_size) : 'loading...'}</td>
                      <td>{infos[db] ? withCommas(infos[db].info.doc_del_count) : 'loading...'}</td>
                      <td>{infos[db] ? infos[db].info.update_seq.split('-')[0] : 'loading...'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <br /><br />
            <table>
              <thead>
                <tr>
                  <th>Couch Server Links</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><Link to={`/${couch}/view-config`}>config</Link></td>
                </tr>
                <tr>
                  <td><Link to={`/${couch}/view-admins`}>admin</Link></td>
                </tr>
                <tr>
                  <td><a target='_blank' href={`${couchUrl}_scheduler/jobs`}>_scheduler/jobs</a> (replication status) </td>
                </tr>
              </tbody>
            </table>
            <br /><br />
            <AllowEditButton
              couchUrl={couchUrl}
              onConfirm={() => this.setState({ showNewDBModal: true })}
            >
            New Database
            </AllowEditButton>
            <NewDatabaseModal
              onClose={() => this.setState({ showNewDBModal: false })}
              onCreateDatabase={this.createDatabase}
              show={showNewDBModal}
            />
          </div>
        ) : (<Loading />)}
      </div>
    )
  }
}
