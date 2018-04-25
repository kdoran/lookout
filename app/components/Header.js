import React from 'react'
import {Link} from 'react-router-dom'
import {getCouchUrl} from 'utils/utils'
import fetcher from 'utils/fetcher'

import './header.css'

export default class extends React.Component {
  render () {
    const { userCtx, match: { params: { couch, dbName, docId } } } = this.props
    const { couchUrl } = getCouchUrl(this.props.match)
    return (
      <div>
        <div className='header'>
          <div style={{ float: 'left' }}>
          couchdash | {couch} |
          user: {`${userCtx.name}`}
            {dbName && <span> | db: {dbName} </span>}
          </div>
          <div style={{ float: 'right' }}>
            {docId && <span><Link to={`/${couch}/${dbName}`}>docs</Link> | </span>}
            {dbName && <span><Link to={`/${couch}/`}>dbs</Link> | </span>}
            <a href='#' onClick={() => fetcher.destroySession(couchUrl)}>logout</a> |&nbsp;
            <Link to='/'>change couch</Link>
          </div>
        </div>
        <br /><br /><br /><br />
      </div>
    )
  }
}
