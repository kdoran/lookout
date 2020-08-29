const React = require('react')
const {Link} = require('react-router-dom')
const {withCommas} = require('../utils/utils')

class Pagination extends React.Component {
  render () {
    const { total, displayed, path, limit, offset } = this.props
    const startingNumber = total === 0 ? 0 : 1 + offset
    const previousNumber = offset - limit
    const nextNumber = offset + limit

    const showPrevious = startingNumber !== 1
    const previousPath = (previousNumber > 0)
      ? `${path}?offset=${previousNumber}`
      : path
    const showNext = offset + displayed < total
    const showLinks = showPrevious || showNext
    return (
      <div>

        {withCommas(startingNumber)} - {withCommas(offset + displayed)} of {withCommas(total)}
        {showLinks && (
          <div>
            {showPrevious ? (
              <Link to={previousPath}>previous</Link>
            ) : 'previous'}
            <span> </span>
            {showNext ? (
              <Link to={path + '?offset=' + nextNumber}>next</Link>
            ) : 'next'}
          </div>
        )}
      </div>
    )
  }
}

module.exports = {Pagination}
