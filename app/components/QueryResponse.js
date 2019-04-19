import React from 'react'

export default class extends React.Component {
  render () {
    const { result } = this.props
    return (
      <div>
        <section className='docs-controls'>
        </section>
        <pre>
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    )
  }
}
