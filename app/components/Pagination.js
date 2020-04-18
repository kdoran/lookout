const React = require('react')
const {Link} = require('react-router-dom')
const {withCommas} = require('../utils/utils')

class Pagination extends React.Component {
  render () {
    const { total, displayed, path, limit, offset } = this.props
    const startingNumber = total === 0 ? 0 : 1 + offset
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
            <Link to={path}>previous </Link>
          )}
          {previousNumber < 0 && 'previous '}
          {offset + displayed < total && (
            <Link to={path + '?offset=' + nextNumber}>next</Link>
          )}
          {offset + displayed >= total && 'next'}
        </div>
      </div>
    )
  }
}

module.exports = {Pagination}
