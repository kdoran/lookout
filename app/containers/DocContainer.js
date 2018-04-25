import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import EditDocContainer from 'containers/EditDocContainer'
import { getCouchUrl } from 'utils/utils'

export default class extends React.Component {
  constructor (props) {
    super(props)
    const { docId } = props.match.params
    const { dbName, couchUrl } = getCouchUrl(props.match)
    this.state = {
      dbName,
      couchUrl,
      docId: decodeURIComponent(docId),
      doc: null,
      loaded: false,
      error: null,
      editing: false
    }
  }

  async componentDidMount () {
    const {couchUrl, dbName, docId} = this.state
    try {
      const doc = await fetcher.dbGet(couchUrl, dbName, docId)
      this.setState({ doc, loaded: true })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  render () {
    const { loaded, error, doc, docId, editing, dbName } = this.state
    return (
      <div>
        <h1>{docId}</h1>
        {loaded ? error ? <Error error={error} /> : (
          <div>
            <pre>
              {JSON.stringify(doc, null, 2)}
            </pre>
            <button
              onClick={() => this.setState({ editing: !this.state.editing })}
            >{editing ? 'cancel' : 'edit'}</button>
            {editing && (
              <div>
                <EditDocContainer dbName={dbName} doc={doc} />
              </div>
            )}
          </div>
        ) : (<Loading />)}
      </div>
    )
  }
}
