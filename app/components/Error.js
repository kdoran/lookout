import React from 'react'

export default class extends React.Component {
  render () {
    const { error, children } = this.props
    const errorStringified = JSON.stringify(error, null, 2)
    const message = errorStringified === '{}'
      ? error.toString()
      : errorStringified
    return (
      <div className='error'>
        <pre>{message}</pre>
        {children}
      </div>
    )
  }
}
