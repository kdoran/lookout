import React from 'react'
import {Link} from 'react-router-dom'
import { parseUrl } from 'utils/utils'
import fetcher from 'utils/fetcher'

import './nav.css'

export default class extends React.Component {
  render () {
    const { userCtx, match: { params: { couch } } } = this.props
    const couchUrl = parseUrl(couch)
    return (
      <div className='nav-container'>
        <div className='nav'>
          <span className='nav-left'>
            CouchDB Lookout | <Link to='/'>change couch</Link>
          </span>
          <span className='nav-right'>
            user: <Link to={`/${couch}/_users/org.couchdb.user:${encodeURIComponent(userCtx.name)}`}>{userCtx.name}</Link> |&nbsp;
            <a href='#' onClick={() => fetcher.destroySession(couchUrl)}>logout</a>
          </span>
        </div>
      </div>
    )
  }
}
