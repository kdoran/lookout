const React = require('react')
const {Link} = require('react-router-dom')
const {Modal} = require('./Modal')
const {Search} = require('./Search')

require('./nav.css')

class Footer extends React.Component {
  state = { showSearchModal: false }

  toggleSearchModal = (e) => {
    if (e) e.preventDefault()
    this.setState({ showSearchModal: !this.state.showSearchModal })
  }

  onSelect = (id) => {
    const { match: { params: { couch, dbName } } } = this.props
    const url = `/${couch}/${dbName}/${encodeURIComponent(id)}`
    this.props.history.push(url)
    this.setState({showSearchModal: false})
  }

  logout = async (event) => {
    event.preventDefault()
    const { user, match: { params: { couch, dbName } } } = this.props
    await this.props.api.logout()
    window.location.reload()
  }

  render () {
    const { user, match: { params: { couch, dbName } } } = this.props
    const { showSearchModal } = this.state

    return (
      <div className='nav-container'>
        <div className='nav'>
          <span className='nav-left'>
            CouchDB Lookout
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
            dbName={dbName}
            couch={couch}
            api={this.props.api}
            onClose={this.toggleSearchModal}
            onSelect={this.onSelect}
          />
        </Modal>
      </div>
    )
  }
}

module.exports = {Footer}
