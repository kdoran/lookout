import React from 'react'
import { Link } from 'react-router-dom'

export default class extends React.Component {
  render () {
    const { couch, dbName, docId, final } = this.props

    if (final) {
      return (
        <div className='breadcrumbs'>
          <Link to={`/${couch}/`}>{couch}</Link>
          <span> / </span>
          <Link to={`/${couch}/${dbName}/`}>{dbName}</Link>
          <span> / </span>
          <Link to={`/${couch}/${dbName}/${docId}`}>{docId}</Link>
          <span> / </span>
          <span> {final} </span>
        </div>
      )
    }

    if (docId) {
      return (
        <div className='breadcrumbs'>
          <Link to={`/${couch}/`}>{couch}</Link>
          <span> / </span>
          {dbName && <span><Link to={`/${couch}/${dbName}/`}>{dbName}</Link><span> / </span></span>}
          <span> {docId} </span>
        </div>
      )
    }

    if (dbName) {
      return (
        <div className='breadcrumbs'>
          <Link to={`/${couch}/`}>{couch}</Link>
          <span> / </span>
          <span>{dbName}</span>
        </div>
      )
    }

    return (
      <div className='breadcrumbs'>
        <span>{couch}</span>
      </div>
    )
  }
}
