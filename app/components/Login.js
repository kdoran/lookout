import React from 'react'

export default class LoginContainer extends React.Component {
  tryLogin = event => {
    event.preventDefault()
    this.props.onSubmit(this.refs.username.value, this.refs.password.value)
  }

  render () {
    const {error} = this.props
    return (
      <form onSubmit={this.tryLogin}>
        <h1>Login</h1>
        <input autoFocus type='text' ref='username' /> <br />
        <input type='password' ref='password' />
        {error && <pre className='error'>{JSON.stringify(error, null, 2)}</pre>} <br />
        <button type='submit'>Submit</button> <br />
      </form>
    )
  }
}
