import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'

import { Link } from 'react-router-dom'

export default class extends React.Component {
  state = {}


  render () {
    return (
      <div>
        <h2>Doc Search</h2>
        <label>
          <input
            autoFocus
            placeholder='id regex without //'
          />
        </label>
      </div>
    )
  }
}
