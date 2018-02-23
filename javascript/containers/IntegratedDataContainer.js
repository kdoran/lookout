import React from 'react'
import {getIntegratedData} from './../client'
import {Link} from 'react-router-dom'

export default class IntegratedDataContainer extends React.Component {
  state = {
    loading: true,
    rows: [],
    params: { start_key: '"z"' }
  }

  componentDidMount = () => {
    getIntegratedData(this.state.params).then(rows => {
      this.setState({ rows, loading: false })
    })
  }

  render () {
    const { loading, rows } = this.state
    console.log(rows)
    return (
      <div className='integrated-data'>
        <h1>Integrated Data Docs</h1>
        Params: <pre>{JSON.stringify(this.state.params, null, 2)}</pre>
        {loading
        ?
          <div>Loading...</div>
        :
          <div>
            Total rows: {rows.length}
            <br />
            {rows.map(row => (
              <div className='doc-link' key={row.id}>
                <Link to={`doc/${row.id}`} >{row.id}</Link>
              </div>
            ))}
            {!rows.length && 'No rows found.'}
          </div>
        }
      </div>
    )
  }
}
