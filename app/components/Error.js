import React from 'react'

export default class extends React.Component {
  render () {
    const { error, children } = this.props
    return (
      <div className='error'>
        <pre>{JSON.stringify(error, null, 2)}</pre>
        {children}
      </div>
    )
  }
}
