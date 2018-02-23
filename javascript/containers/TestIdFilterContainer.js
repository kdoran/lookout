import React from 'react'
import {getFilteredIds} from './../client'

export default class TestIdFilterContainer extends React.Component {
  state = { loading: true, response: null }

  componentDidMount = () => {
    getFilteredIds().then(response => {
      this.setState({ response, loading: false })
    }).catch(err => {
      this.setState({ response: err, loading: false })
    })
  }

  render () {
    const { loading, response } = this.state
    return (
      <div className='id-filter'>
        <h1>ID Filter</h1>
        {loading
        ?
          <div>Loading...</div>
        :
          <pre>
            {JSON.stringify(response, null, 2)}
          </pre>
        }
      </div>
    )
  }
}
