const React = require('react')
const {Link} = require('react-router-dom')

function ButtonLink ({to, children}) {
  return (
    <Link to={to}>
      <button>
        {children}
      </button>
    </Link>
  )
}

module.exports = {ButtonLink}
