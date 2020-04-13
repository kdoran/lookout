import React from 'react'
import {Link} from 'react-router-dom'
import { parseUrl } from 'utils/utils'
import Modal from './Modal'
import SearchContainer from '../containers/SearchContainer'

import './nav.css'

export default class Footer extends React.Component {
  state = { showSearchModal: false }

  toggleSearchModal = (e) => {
    if (e) e.preventDefault()
    this.setState({ showSearchModal: !this.state.showSearchModal })
  }

  logout = async (event) => {
    event.preventDefault()
    await this.props.api.logout()
    window.location.href = '#/'
    window.location.reload()
  }

  render () {
    const { user, dbs, match: { params: { couch, dbName } } } = this.props
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
            user: <Link to={`/${couch}/_users/org.couchdb.user:${encodeURIComponent(user.name)}`}>{user.name}</Link> |&nbsp;
            <a href='#' onClick={this.logout}>logout</a>
          </span>
        </div>
        <Modal
          show={showSearchModal}
          onClose={this.toggleSearchModal}
          className='search-modal'
        >
          <SearchContainer
            multipleSearch={!dbName}
            db={dbName}
            dbs={dbs}
            couchUrl={couchUrl}
            onClose={this.toggleSearchModal}
          />
        </Modal>
      </div>
    )
  }
}
