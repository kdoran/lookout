import React from 'react'
import {Link} from 'react-router-dom'
import {withCommas} from 'utils/utils'

export default class Pagination extends React.Component {
  render () {
    const { total, displayed, path, limit, offset } = this.props
    const startingNumber = 1 + offset
    const previousNumber = offset - limit
    const nextNumber = offset + limit
    return (
      <div>

        {withCommas(startingNumber)} - {withCommas(offset + displayed)} of {withCommas(total)}
        <div>
          {previousNumber > 0 && (
            <Link to={path + '?offset=' + previousNumber}>previous</Link>
          )}
          {previousNumber === 0 && (
            <Link to={path}>previous</Link>
          )}
          {previousNumber < 0 && 'previous'}
          &nbsp;
          {offset + displayed < total && (
            <Link to={path + '?offset=' + nextNumber}>next</Link>
          )}
          {offset + displayed >= total && 'next'}
        </div>
      </div>
    )
  }
}
