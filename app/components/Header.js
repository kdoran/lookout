import React from 'react'
import {Link} from 'react-router-dom'
import fetcher from 'utils/fetcher'
import Login from 'components/Login'
import {parseUrl} from 'utils/utils'

const styles = {
  whiteSpace: 'nowrap',
  overflowX: 'scroll'
}

function getDefaultState (userCtx = {}) {
  return {
    error: null,
    loading: false,
    userCtx
  }
}

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = getDefaultState(props.userCtx)
  }

  componentWillReceiveProps (newProps) {
    if (newProps.couchUrl) {
      this.setState(getDefaultState(newProps.userCtx))
    }
  }

  logout = () => {
    this.setState(getDefaultState)
    fetcher.destroySession().then(() => window.location.reload())
  }

  login = (name, password) => {
    this.setState({loading: true}, () => {
      fetcher.login(name, password).then(userCtx => {
        window.location.reload()
      }).catch(error => this.setState({error, loading: false}))
    })
  }

  render () {
    const {couchUrl} = this.props
    const { error, userCtx, loading } = this.state
    const roles = userCtx.roles ? userCtx.roles.join(', ') : null
    const authenticated = userCtx.name || (userCtx.roles && userCtx.roles.length)
    return (
      <div style={styles}>
        <div>
          {couchUrl ? (<Link to={`/${couchUrl}/`}>couchviews</Link>) : 'couchviews'} |&nbsp;
          {couchUrl} (<Link to='/'>switch couch</Link>) (<a target='_blank' href={parseUrl(couchUrl) + '_utils/'}>fauxton</a>) |
          name: {`${userCtx.name}`}&nbsp;
          {authenticated && (<span>(<a href='#' onClick={() => this.logout()}>
              logout
          </a>)</span>
          )}  |
           roles: [ {roles} ]
        </div>
        {!authenticated && (
          <Login onSubmit={this.login} error={error} loading={loading} />
        )}
      </div>
    )
  }
}
