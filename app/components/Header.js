import React from 'react'
import {Link} from 'react-router-dom'
import fetcher from 'utils/fetcher'
import localStorager from 'utils/localstorager'
import Login from 'components/Login'

const styles = {
  whiteSpace: 'nowrap',
  overflow: 'scroll'
}

const defaultState = {
  error: null,
  userCtx: localStorager.get('userCtx') || {}
}

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = defaultState
  }

  componentWillReceiveProps (newProps) {
    if (newProps.couchUrl) {
      this.setState(defaultState)
    }
  }

  logout = () => {
    localStorager.destroy('userCtx')
    this.setState(defaultState)
    fetcher.destroySession().then(() => window.location.reload())
  }

  login = (name, password) => {
    fetcher.login(name, password).then(userCtx => {
      delete userCtx.ok
      localStorager.set('userCtx', userCtx)
      this.setState({ userCtx })
    }).catch(error => this.setState({error}))
  }

  render () {
    const {couchUrl} = this.props
    const { error, userCtx } = this.state
    const roles = userCtx.roles ? userCtx.roles.join(', ') : null
    return (
      <div style={styles}>
        <div>
          Aloha |&nbsp;
          <Link to='/'>{couchUrl}</Link> |&nbsp;
          <a href='#' onClick={() => this.logout()}>
            logout
          </a> |
          name: {`${userCtx.name}`} roles: [ {roles} ]
        </div>
        {!userCtx.name && !roles && (
          <Login onSubmit={this.login} error={error} />
        )}
      </div>
    )
  }
}
