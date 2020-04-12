import React from 'react'
import fetcher from 'utils/fetcher'
import {Link} from 'react-router-dom'

export default class LoginContainer extends React.Component {
  state = { loading: false }

  tryLogin = async event => {
    event.preventDefault()
    this.setState({ loading: true })
    try {
      await this.props.login(this.refs.username.value, this.refs.password.value)
    } catch (error) {
      this.setState({ error, loading: false })
    }
  }

  render () {
    const { error, loading } = this.state
    const { couchUrl } = this.props
    return (
      <form onSubmit={this.tryLogin}>
        <h1>couchdb lookout: login</h1>
        <div>{couchUrl} <Link to='/'>change couch</Link></div>
        <input autoFocus type='text' ref='username' /> <br />
        <input type='password' ref='password' />
        {error && <pre className='error'>{error.message ? error.message : JSON.stringify(error, null, 2)}</pre>} <br />
        <button disabled={loading} type='submit'>{loading ? 'Loading...' : 'Submit'}</button> <br />
      </form>
    )
  }
}
