import React from 'react'
import {Link} from 'react-router-dom'
import {getCouchUrl} from 'utils/utils'
import fetcher from 'utils/fetcher'

import './nav.css'

export default class extends React.Component {
  render () {
    const { userCtx, match: { params: { couch, dbName, docId } } } = this.props
    const { couchUrl } = getCouchUrl(this.props.match)
    const couchClass = couchUrl.includes('localhost') ? '' : 'error'
    return (
      <div className='nav-container'>
        <div className='nav'>
          <span className='nav-left'>
            <Link to='/'>change couch</Link> |&nbsp;
            <a href='#' onClick={() => fetcher.destroySession(couchUrl)}>logout</a> |&nbsp;
            {!dbName && 'databases'}
            {dbName && <span><Link to={`/${couch}/`}>databases</Link> | </span>}
            {docId && <span><Link to={`/${couch}/${dbName}`}>docs</Link></span>}
            {!docId && dbName && 'docs'}
          </span>
          <span className='nav-right'>
            couchdash | <span className={couchClass}>{couch}</span> |
            user: {`${userCtx.name}`}
          </span>
        </div>
      </div>
    )
  }
}
