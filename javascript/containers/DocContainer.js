import React from 'react'
import {getDoc, deleteDocs} from './../client'

export default class TestIdFilterContainer extends React.Component {
  state = { loading: true, doc: null, error: null }

  componentDidMount = () => {
    this.loadDoc()
  }

  loadDoc = () => {
    getDoc(this.props.match.params.id).then(doc => {
      this.setState({ doc, loading: false })
    }).catch(error => {
      this.setState({ error, loading: false })
    })
  }

  deleteDoc = () => {
    deleteDocs([ this.state.doc ]).then(success => {
      this.loadDoc()
    })
  }

  render () {
    const { loading, doc, error } = this.state
    return (
      <div className='id-filter'>
        <h1>Doc</h1>
        <button onClick={this.deleteDoc}>Delete this doc</button>
        {loading
        ?
          <div>Loading...</div>
        :
          <pre>
            {JSON.stringify(doc, null, 2)}
          </pre>
        }
        {error && JSON.stringify(error, null, 2)}
      </div>
    )
  }
}
