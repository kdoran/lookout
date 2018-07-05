import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import AllowEditButton from 'components/AllowEditButton'
import { Link } from 'react-router-dom'

import './doc-container.css'

export default class extends React.Component {
  state = {
    doc: null,
    loaded: false,
    error: null,
    meta: null,
    docId: null
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const docId = decodeURIComponent(nextProps.match.params.docId)
    return { ...prevState, docId }
  }

  async componentDidMount () {
    const { couchUrl, dbName, location } = this.props
    const { docId } = this.state
    try {
      const search = location.search
      const resource = search ? docId + search : docId
      const doc = await fetcher.dbGet(couchUrl, dbName, resource)
      const meta = await fetcher.dbGet(couchUrl, dbName, docId, { meta: true })
      this.setState({ doc, meta, loaded: true })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  render () {
    const { loaded, error, doc, meta, docId } = this.state
    const { couchUrl, dbName, couch } = this.props

    return (
      <div>
        <h4>{dbName}</h4>
        <h2>{docId}</h2>
        {error && <Error error={error} />}
        {!error && !loaded && (<Loading />)}
        {!error && loaded && (
          <div>
            <div className='controls'>
              <AllowEditButton
                dbName={dbName}
                couchUrl={couchUrl}
                onConfirm={() => this.props.history.push(`editing/${docId}`)}
              >
              edit
              </AllowEditButton>
            </div>
            <pre>
              {JSON.stringify(doc, null, 2)}
            </pre>
            {meta && meta._revs_info && (
              <span>
                <h5>Rev Links</h5>
                {meta._revs_info.map(row => (
                  <div key={row.rev}>
                    <span>
                      {(row.status === 'available')
                        ? (
                          <Link to={`/${couch}/${dbName}/${docId}/${row.rev}/`}>
                            {row.rev}
                          </Link>
                        )
                        : row.rev
                      }
                    </span>
                    <span>
                      &nbsp; ({(row.rev === doc._rev) ? 'viewing' : row.status})
                    </span>
                  </div>
                ))}
                {meta._conflicts ? (
                  <div>
                    <h5>Conflicts</h5>
                    {JSON.stringify(meta._conflicts, null, 2)}
                  </div>
                ) : <h5>No Conflicts Found.</h5>}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
}
