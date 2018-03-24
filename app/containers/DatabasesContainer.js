import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import {Link} from 'react-router-dom'
import {showMBSize, showSize, withCommas} from 'utils/utils'

const LIMIT = 100

const tableStyles = {
  width: '80%',
  margin: '0 auto',
  textAlign: 'right'
}

const alignLeft = {
  textAlign: 'left'
}

export default class extends React.Component {
  state = { loaded: false, infosLoaded: false, dbs: null, error: null, infos: null }

  componentDidMount () {
    fetcher.get('_all_dbs', { limit: LIMIT }).then(dbs => {
      this.setState({ dbs, loaded: true })
      this.fetchInfos(dbs)
    }).catch(error => this.setState({ error, loaded: true }))
  }

  fetchInfos = dbs => {
    const infos = {}
    const promises = dbs.map((db, i) => {
      return fetcher.get(db).then(info => {
        infos[db] = info
        if (typeof infos[db].update_seq === 'string') {
          infos[db].update_seq = infos[db].update_seq.split('-')[0]
        }
      }).catch(dbError => {
        console.error(dbError)
      })
    })
    Promise.all(promises).then(() => {
      this.setState({ infos, infosLoaded: true })
    })
  }

  render () {
    const { loaded, error, dbs, infosLoaded, infos } = this.state
    return (
      <div>
        <h1>databases</h1>
        {loaded ? error ? <Error error={error} /> : (
          <table style={tableStyles}>
            <thead>
              <tr>
                <th style={alignLeft}>name</th>
                <th>data size</th>
                <th>disk space</th>
                <th>docs</th>
                <th>deleted</th>
                <th>seq no. (as int)</th>
              </tr>
            </thead>
            <tbody>
              {dbs.map(db => {
                return (
                  <tr key={db}>
                    <td style={alignLeft}><Link to={db}>{db}</Link></td>
                    <td>{infosLoaded ? showSize(infos[db].data_size) : 'loading...'}</td>
                    <td>{infosLoaded ? showMBSize(infos[db].disk_size) : 'loading...'}</td>
                    <td>{infosLoaded ? withCommas(infos[db].doc_count) : 'loading...'}</td>
                    <td>{infosLoaded ? withCommas(infos[db].doc_del_count) : 'loading...'}</td>
                    <td>{infosLoaded ? infos[db].update_seq : 'loading...'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (<Loading />)}
      </div>
    )
  }
}
