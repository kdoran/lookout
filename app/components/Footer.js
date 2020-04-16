const React = require('react')
const {Link} = require('react-router-dom')
const {parseUrl} = require('../utils/utils')
const {Modal} = require('./Modal')
const {Search} = require('./Search')

require('./nav.css')

class Footer extends React.Component {
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
    const { user, match: { params: { couch, dbName } } } = this.props
    const { showSearchModal } = this.state
    const couchUrl = parseUrl(couch)

    return (
      <div className='nav-container'>
        <div className='nav'>
          <span className='nav-left'>
            CouchDB Lookout | <Link to='/'>change couch</Link>
            {dbName && <span> | <a href='' onClick={this.toggleSearchModal}>search</a></span>}
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
          <Search
            multipleSearch={!dbName}
            db={dbName}
            couchUrl={couchUrl}
            api={this.props.api}
            onClose={this.toggleSearchModal}
          />
        </Modal>
      </div>
    )
  }
}

module.exports = {Footer}
