import React from 'react'
import AceEditor from 'react-ace'
import brace from 'brace' // eslint-disable-line

import 'brace/mode/json'
import 'brace/mode/javascript'
import 'brace/theme/github'

const ACE_HEIGHT = '80%'
const ACE_WIDTH = '100%'

export default class extends React.Component {
  async componentDidMount () {
    this.editor = this.refs.aceEditor.editor
    this.editor.session.setOptions({ tabSize: 2 })
    this.editor.commands.removeCommands(['gotoline', 'find'])
    // 
    // const {onEdit, onCmdEnter, onEscape, onSave} = this.props
    //
    // const commandKeys = [
    //   onCmdEnter && { // commands is array of key bindings.
    //     name: 'onCmdEnter', // name for the key binding.
    //     bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'}, // key combination used for the command.
    //     exec: () => onCmdEnter(this.editor.getValue()) // function to execute when keys are pressed.
    //   },
    //   onSave && { // commands is array of key bindings.
    //     name: 'onSave', // name for the key binding.
    //     bindKey: {win: 'Ctrl-s', mac: 'Command-s'}, // key combination used for the command.
    //     exec: () => onSave(this.editor.getValue()) // function to execute when keys are pressed.
    //   },
    //   onEscape && { // commands is array of key bindings.
    //     name: 'onEscape', // name for the key binding.
    //     bindKey: {win: 'Esc', mac: 'Esc'}, // key combination used for the command.
    //     exec: () => onEscape(this.editor.getValue()) // function to execute when keys are pressed.
    //   }
    // ].filter(x => x)

    if (this.props.startRow) {
      this.editor.selection.moveTo(this.props.startRow, this.props.startColumn)
    }
  }

  cmdEnter = () => {
    if (this.props.onCmdEnter) {
      this.props.onCmdEnter(this.editor.getValue())
    }
  }

  render () {
    const {focus = true} = this.props
    return (
      <AceEditor
        mode='json'
        theme='github'
        ref='aceEditor'
        width={ACE_WIDTH}
        height={ACE_HEIGHT}
        focus={focus}
        commands={
          [{ // commands is array of key bindings.
            name: 'commandName', // name for the key binding.
            bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'}, // key combination used for the command.
            exec: () => this.cmdEnter() // function to execute when keys are pressed.
          }]
        }
        showPrintMargin={false}
        editorProps={{$blockScrolling: true}}
        {...this.props}
      />
    )
  }
}
