import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import Breadcrumbs from 'components/Breadcrumbs'
import AllowEditButton from 'components/AllowEditButton'
import Modal from 'components/Modal'
import { downloadJSON } from 'utils/download'

export default class AdminContainer extends React.Component {
  state = {
    loaded: false,
    error: null,
    docId: null,
    adminConfig: {},
    showCreateAdminModal: false,
    adminName: '',
    adminPassword: ''
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const docId = decodeURIComponent(nextProps.match.path.split('/:couch/')[1])
    return { ...prevState, docId }
  }

  async componentDidMount () {
    const { couchUrl } = this.props
    const { docId } = this.state
    try {
      const adminConfig = await fetcher.get(`${couchUrl}${docId}`)
      this.setState({ adminConfig, loaded: true })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  onSubmitNewAdmin = async event => {
    event.preventDefault()
    const {couch, couchUrl} = this.props
    const {adminName, docId, adminConfig, adminPassword} = this.state
    if (!adminName || !adminPassword) {
      window.alert('admin name and password required')
      return
    }
    window.alert('downloading current admin list as backup')
    downloadJSON(adminConfig, `${couch}-backup-admin-config.json`)
    const url = `${couchUrl}${docId}/${adminName}`
    try {
      await fetcher.put(url, adminPassword)
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
        {error && <Error error={error} />}
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
