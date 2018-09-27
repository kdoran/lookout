import React from 'react'
import {Link} from 'react-router-dom'
import { parseUrl } from 'utils/utils'
import fetcher from 'utils/fetcher'
import Modal from './Modal'
import SearchContainer from '../containers/SearchContainer'

import './nav.css'

export default class extends React.Component {
  state = { showSearchModal: true }

  toggleSearchModal = (e) => {
    if (e) e.preventDefault()
    this.setState({ showSearchModal: !this.state.showSearchModal })
  }

  render () {
    const { userCtx, dbs, match: { params: { couch, dbName } } } = this.props
    const { showSearchModal } = this.state
    const couchUrl = parseUrl(couch)

    return (
      <div className='nav-container'>
        <div className='nav'>
          <span className='nav-left'>
            CouchDB Lookout | <Link to='/'>change couch</Link>
            <span> | <a href='' onClick={this.toggleSearchModal}>search</a></span>
          </span>
          <span className='nav-right'>
            user: <Link to={`/${couch}/_users/org.couchdb.user:${encodeURIComponent(userCtx.name)}`}>{userCtx.name}</Link> |&nbsp;
            <a href='#' onClick={() => fetcher.destroySession(couchUrl)}>logout</a>
          </span>
        </div>
        <Modal
          show={showSearchModal}
          onClose={this.toggleSearchModal}
          multipleSearch={!dbName}
          db={dbName}
          dbs={dbs}
          className='search-modal'
        >
          <SearchContainer />
        </Modal>
      </div>
    )
  }
}
