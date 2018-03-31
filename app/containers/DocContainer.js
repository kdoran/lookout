import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import EditDocContainer from 'containers/EditDocContainer'

export default class extends React.Component {
  constructor (props) {
    super(props)
    const { dbName, docId } = this.props.match.params
    this.state = {
      dbName,
      docId: decodeURIComponent(docId),
      doc: null,
      loaded:
      false,
      error: null,
      editing: false
    }
  }

  componentDidMount () {
    const {dbName, docId} = this.state
    fetcher.get(dbName + '/' + docId).then(doc => {
      this.setState({ doc, loaded: true })
    }).catch(error => this.setState({ error, loaded: true }))
  }

  render () {
    const { loaded, error, doc, docId, editing } = this.state
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
              <EditDocContainer doc={doc} />
            </div>
            )}
          </div>
        ) : (<Loading />)}
      </div>
    )
  }
}
