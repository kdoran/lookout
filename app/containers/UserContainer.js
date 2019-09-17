import React from 'react'
import fetcher from '../utils/fetcher'
import AllowEditButton from '../components/AllowEditButton'
import Breadcrumbs from '../components/Breadcrumbs'
import Modal from '../components/Modal'

export default class UserContainer extends React.Component {
    state = {
      admin: false,
      error: null,
      doc: null,
      docId: null,
      username: '',
      changePassword: false,
      firstPassword: '',
      secondPassword: ''
    }

    static getDerivedStateFromProps (nextProps, prevState) {
      const docId = decodeURIComponent(nextProps.match.params.docId)
      return { ...prevState, docId }
    }
    async componentDidMount () {
      const { couchUrl } = this.props
      const dbName = '_users'
      const { rev } = this.props
      const { docId } = this.state
      const resource = rev ? `${docId}?rev=${rev}` : docId
      try {
        const doc = await fetcher.dbGet(couchUrl, dbName, resource)
        const meta = await fetcher.dbGet(couchUrl, dbName, docId, { meta: true })
        this.setState({ doc, meta, loaded: true })
      } catch (error) {
        this.setState({ error, loaded: true })
      }
      const {userCtx} = await fetcher.checkSession(couchUrl)
      this.setState({username: userCtx.name})
      // To check if user is admin or not
      if (userCtx.roles[0] === '_admin') {
        this.setState({admin: true})
      }
    }

    changePassword = () => this.setState({changePassword: true})
    close = () => this.setState({changePassword: false})

    onSubmitPassword = async () => {
      const {firstPassword, secondPassword, admin, docId, username, doc} = this.state
      const { couchUrl, couch } = this.props
      const dbName = '_users'

      if (!firstPassword || !secondPassword) {
        window.alert('Fill the form completely')
      } else if (firstPassword !== secondPassword) {
        window.alert('Passwords dont match')
      }
      if (admin) {
        // IF user is admin specify the url to be pushed to as admin users have no doc
        let url
        couch.startsWith('localhost:') ? url = `${couchUrl}_node/couchdb@localhost/_config/admins/${username}` : url = `${couchUrl}_node/nonode@nohost/_config/admins/${username}`
        try {
          // Just pushes the password with the exact username to the config admin doc
          await fetcher.put(url, firstPassword)
        } catch (err) { this.setState({err}) }
      } else {
        // For non-admin users with doc
        const resource = `${docId}?rev=${doc._rev}`
        const payload = {
          name: username,
          type: 'user',
          roles: [],
          password: firstPassword
        }
        fetcher.dbPut(couchUrl, dbName, resource, payload).catch(err => this.setState(err))
      }
    }

    render () {
      const { couch, couchUrl } = this.props
      const {doc, admin, docId, changePassword, firstPassword, secondPassword} = this.state
      const dbName = '_users'
      return (
        <div>
          <Breadcrumbs couch={couch} dbName={dbName} docId={docId} />
          <AllowEditButton
            dbName={dbName}
            couchUrl={couchUrl}
            onConfirm={this.changePassword}
          >
            Change Password
          </AllowEditButton>
          <Modal
            show={changePassword}
            heading='Change Password'
            onClose={this.close}
          >
            <form onSubmit={this.onSubmitPassword}>
              <label>
                  Password
                <input
                  type='password'
                  placeholder='Enter your new password'
                  autoFocus
                  value={firstPassword}
                  onChange={({target: {value}}) => { this.setState({firstPassword: value}) }}
                />
              </label>
              <label>
                  Re-enter Password
                <input
                  type='password'
                  placeholder='Re-enter your new password'
                  value={secondPassword}
                  onChange={({target: {value}}) => { this.setState({secondPassword: value}) }}
                />
              </label>
              <button
                className='action-button'
                type='submit'
              >
                  Submit
              </button>
              <button onClick={this.close}>cancel</button>
            </form>
          </Modal>
          { admin
            ? <h1>You're Admin</h1>
            : <pre>
              {JSON.stringify(doc, null, 2)}
            </pre>}
        </div>
      )
    }
}
