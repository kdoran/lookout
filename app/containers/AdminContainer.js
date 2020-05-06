const React = require('react')
const {
  Loading, ErrorDisplay, Breadcrumbs, AllowEditButton, Modal
} = require('../components')

class AdminContainer extends React.Component {
  state = {
    loaded: false,
    error: null,
    adminConfig: {},
    showCreateAdminModal: false,
    adminName: '',
    adminPassword: ''
  }

  componentDidMount () {
    this.load()
  }

  componentDidUpdate (previousProps) {
    const {dbUrl, searchParams: {offset}} = this.props
    if (previousProps.dbUrl !== dbUrl || previousProps.searchParams.offset !== offset) {
      this.load()
    }
  }

  load = async () => {
    try {
      const adminConfig = await this.props.api.couchServer.getAdminConfig()
      this.setState({ adminConfig, loaded: true })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  onSubmitNewAdmin = async event => {
    event.preventDefault()
    const {adminName, adminPassword} = this.state
    if (!adminName || !adminPassword) {
      window.alert('admin name and password required')
      return
    }
    try {
      await this.props.api.couchServer.updateAdmin(adminName, adminPassword)
      window.alert(`admin ${adminName} created/updated succesffully`)
      window.location.reload()
    } catch (error) {
      this.setState({error})
    }
  }

  render () {
    const { couch, couchUrl } = this.props
    const { loaded, error, adminConfig, adminPassword, showCreateAdminModal, adminName } = this.state

    return (
      <div className='config-container'>
        <Breadcrumbs couch={couch} docId={'_config'} />
        {error && <ErrorDisplay error={error} />}
        {!error && !loaded && (<Loading />)}
        {!error && loaded && (
          <div>
            <h1>Admin Edit</h1>
            <AllowEditButton
              couchUrl={couchUrl}
              onConfirm={() => this.setState({showCreateAdminModal: true})}
            >
            New Admin
            </AllowEditButton>
            <Modal
              show={showCreateAdminModal}
              heading='Create New Admin'
            >
              <form onSubmit={this.onSubmitNewAdmin}>
                <label>
                  New Admin
                  <input
                    type='text'
                    placeholder='valid CouchDB admin name (no spaces please at most maybe just a -)'
                    autoFocus
                    value={adminName}
                    onChange={({target: {value}}) => { this.setState({adminName: value}) }}
                  />
                </label>
                <label>
                  Password
                  <input
                    type='password'
                    placeholder='password'
                    value={adminPassword}
                    onChange={({target: {value}}) => { this.setState({adminPassword: value}) }}
                  />
                </label>
                {error && (<div className='error'>{error}</div>)}
                <button
                  className='action-button'
                  type='submit'
                >
                  Submit
                </button>
                <button onClick={() => this.setState({showCreateAdminModal: false})}>cancel</button>
              </form>
            </Modal>
            <h2>Current Admins</h2>
            {Object.keys(adminConfig).map(adminName => (<div key={adminName}>{adminName}</div>))}
          </div>
        )}
      </div>
    )
  }
}

module.exports = {AdminContainer}
