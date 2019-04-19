import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import NewDatabaseContainer from 'containers/NewDatabaseContainer'
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
    showNewDBModal: false
  }

  async componentDidMount () {
    const { couchUrl, dbs } = this.props
    try {
      this.setState({ loaded: true })
      this.fetchInfos(couchUrl, dbs)
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  fetchInfos = async (couchUrl, dbs) => {
    const infos = {}
    for (let db of dbs) {
      try {
        const info = await fetcher.get(couchUrl + db)
        infos[db] = info
        if (typeof infos[db].update_seq === 'string') {
          infos[db].update_seq = infos[db].update_seq.split('-')[0]
        }
      } catch (error) {
        infos[db] = {}
        console.error(error)
      }
      this.setState({ infos })
    }
  }

  render () {
    const { couchUrl, couch, dbs } = this.props
    const { history } = this.props
    const { loaded, error, infos, showNewDBModal } = this.state

    return (
      <div>
        <Breadcrumbs couch={couch} />
        {loaded ? error ? <Error error={error} /> : (
          <div>
            <table>
              <thead>
                <tr>
                  <th>name</th>
                  <th>docs</th>
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
                      <td><Link to={`/${couch}/${db}/query`}>{db}</Link> | <Link to={`/${couch}/${db}/`}>all docs</Link></td>
                      <td>{infos[db] ? withCommas(infos[db].doc_count) : 'loading...'}</td>
                      <td>{infos[db] ? showMBSize(infos[db].data_size) : 'loading...'}</td>
                      <td>{infos[db] ? showMBSize(infos[db].disk_size) : 'loading...'}</td>
                      <td>{infos[db] ? withCommas(infos[db].doc_del_count) : 'loading...'}</td>
                      <td>{infos[db] ? infos[db].update_seq : 'loading...'}</td>
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
                  <td><Link to={couch.startsWith('localhost:') ? `/${couch}/_node/couchdb@localhost/_config` : `/${couch}/_node/nonode@nohost/_config`}>_config</Link></td>
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
            <NewDatabaseContainer
              couchUrl={couchUrl}
              history={history}
              onClose={() => this.setState({ showNewDBModal: false })}
              show={showNewDBModal}
            />
          </div>
        ) : (<Loading />)}
      </div>
    )
  }
}
