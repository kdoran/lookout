import React from 'react'
import AceEditor from 'react-ace'
import brace from 'brace'

import 'brace/mode/json'
import 'brace/mode/javascript'
import 'brace/theme/github'

const ACE_HEIGHT = '80%'
const ACE_WIDTH = '100%'

export default class extends React.Component {
  async componentDidMount () {
    const editor = this.refs.aceEditor.editor
    editor.commands.removeCommands(['gotoline', 'find'])
    if (this.props.startRow) {
      editor.selection.moveTo(this.props.startRow, this.props.startColumn)
    }
  }

  cmdEnter = () => {
    if (this.props.onCmdEnter) this.props.onCmdEnter()
  }

  render () {
    return (
      <AceEditor
        mode='json'
        theme='github'
        ref='aceEditor'
        width={ACE_WIDTH}
        height={ACE_HEIGHT}
        focus={true}
        commands={
          [{   // commands is array of key bindings.
            name: 'commandName', //name for the key binding.
            bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'}, //key combination used for the command.
            exec: () => this.cmdEnter()  //function to execute when keys are pressed.
          }]
        }
        showPrintMargin={false}
        editorProps={{$blockScrolling: true}}
        {...this.props}
      />
    )
  }
}
