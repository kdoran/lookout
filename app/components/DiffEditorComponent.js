import React from 'react'
import { diff as DiffEditor } from 'react-ace'

import 'brace/theme/github'

export default class DiffEditorComponent extends React.Component {
  render () {
    return (
      <DiffEditor
        value={this.props.value}
        height='1000px'
        width='1000px'
        mode='json'
      />
    )
  }
}
