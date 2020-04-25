const React = require('react')

function ErrorDisplay ({error, header}) {
  if (!error) return null

  const url = window.location.href
  const errorStringified = JSON.stringify(error, null, 2)
  // couch error responses sometimes have `reason` and `error` props
  const {error: errorProp, message, reason} = error

  const errorDisplay = (errorStringified === '{}')
    ? JSON.stringify({message, reason, error: errorProp})
    : errorStringified

  return (
    <div>
      <h5 className='error'>{header || 'Error Found'}</h5>
      <pre>
        Url: ${url}
        <br /><br />
        {errorDisplay}
      </pre>
    </div>
  )
}

module.exports = {ErrorDisplay}
