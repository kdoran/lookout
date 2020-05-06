const React = require('react')
const { Link } = require('react-router-dom')
const keyBy = require('lodash/keyBy')
const {
  Loading,
  NewDatabaseModal,
  ErrorDisplay,
  AllowEditButton,
  Breadcrumbs
} = require('../components')
const { showMBSize, withCommas } = require('../utils/utils')

require('./databases-container.css')

class DatabasesContainer extends React.Component {
  state = {
    loaded: false,
    error: null,
    infos: {},
    showNewDBModal: false,
    dbs: []
  }

  componentDidMount () {
    this.fetchInfos().catch(error => this.setState({error}))
  }

  componentDidUpdate (previousProps) {
    if (previousProps.couchUrl !== this.props.couchUrl) { this.fetchInfos() }
  }

  fetchInfos = async () => {
    // infos and dbs are split for couch < 2.2 that does not have
    // single infos call. lazy load dbs & display first
    // so you're not always waiting on the 100 individual info calls
    const serverInfo = await this.props.api.couchServer.getServer()
    const isThreeO = (serverInfo.version && serverInfo.version.startsWith('3'))
    const dbs = await this.props.api.couchServer.listDatabases()
    this.setState({dbs, serverInfo, isThreeO})
    const infosResponse = await this.props.api.couchServer.listInfos(dbs)
    const infos = keyBy(infosResponse, 'key')
    this.setState({loaded: true, infos})
  }

  createDatabase = async (dbName) => {
    const {api, history, couch} = this.props
    try {
      await api.couchServer.createDatabase(dbName)
      window.alert(`Created database ${dbName}`)
      history.push(`/${couch}/${dbName}`)
    } catch (error) {
      this.setState({ error })
    }
  }

  render () {
    const { couchUrl, couch } = this.props
    const { loaded, error, serverInfo, isThreeO, infos, dbs, showNewDBModal } = this.state

    const table = isThreeO
      ? (
        <table>
          <thead>
            <tr>
              <th>name</th>
              <th />
              <th>doc count</th>
              <th>sizes.active</th>
              <th>sizes.external</th>
              <th>sizes.file</th>
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
                  <td>{infos[db] ? showMBSize(infos[db].info.sizes.active) : 'loading...'}</td>
                  <td>{infos[db] ? showMBSize(infos[db].info.sizes.external) : 'loading...'}</td>
                  <td>{infos[db] ? showMBSize(infos[db].info.sizes.file) : 'loading...'}</td>
                  <td>{infos[db] ? withCommas(infos[db].info.doc_del_count) : 'loading...'}</td>
                  <td>{infos[db] ? infos[db].info.update_seq.split('-')[0] : 'loading...'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )
      : (
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
      )

    return (
      <div>
        <Breadcrumbs couch={couch} />
        {loaded ? error ? <ErrorDisplay error={error} /> : (
          <div>
            <div className='server-info'>{JSON.stringify(serverInfo)}</div>
            {table}
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

module.exports = {DatabasesContainer}
