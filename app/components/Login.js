import React from 'react'
import fetcher from 'utils/fetcher'

export default class LoginContainer extends React.Component {
  state = { loading: false }

  async componentDidMount () {
    const { couchUrl } = this.props
    const { userCtx } = await fetcher.checkSession(couchUrl)
    if (userCtx.name) {
      this.props.onAuthenticated(userCtx)
    }
  }

  tryLogin = async event => {
    event.preventDefault()
    const {couchUrl} = this.props
    this.setState({ loading: true })
    try {
      const response = await fetcher.login(couchUrl, this.refs.username.value, this.refs.password.value)
      this.props.onAuthenticated(response)
    } catch (error) {
      this.setState({ error, loading: false })
    }
  }

  render () {
    const { error, loading } = this.state
    const { couchUrl } = this.props
    return (
      <form onSubmit={this.tryLogin}>
        <h1>Couch View: Login</h1>
        <div>{couchUrl}</div>
        <input autoFocus type='text' ref='username' /> <br />
        <input type='password' ref='password' />
        {error && <pre className='error'>{JSON.stringify(error, null, 2)}</pre>} <br />
        <button disabled={loading} type='submit'>{loading ? 'Loading...' : 'Submit'}</button> <br />
      </form>
    )
  }
}
