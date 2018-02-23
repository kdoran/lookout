import React from 'react'
import {login} from './../client'

export default class LoginContainer extends React.Component {
  tryLogin = () => {
    login(this.refs.username.value, this.refs.password.value)
  }

  render () {
    return (
      <form onSubmit={this.tryLogin}>
        <h1>Login</h1>
        <input type='text' ref='username' value='test' />
        <input type='password' ref='password' value='test' />
        <button type='submit'>Submit</button>
      </form>
    )
  }
}
