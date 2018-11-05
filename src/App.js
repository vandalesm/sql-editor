import React, { Component } from 'react'
import {
  Editor, EditorState, //RichUtils, 
  CompositeDecorator,
  getDefaultKeyBinding, KeyBindingUtil
} from 'draft-js'
import './App.css'
import 'draft-js/dist/Draft.css'

class App extends Component {
  constructor(props) {
    super(props)
    const compositeDecorator = new CompositeDecorator([
      {
        strategy: (contentBlock, callback, contentState) => {
          const regex = /\b(select|from|where|group|order|having|by|inner|outer|left|right|cross|join|and|on)[\s]/g
          findWithRegex(regex, contentBlock, callback)
        },
        component: (props) => {
          return (
            <span style={{
              color: 'blue',
              fontStyle: 'italic'
            }}
            >{props.children}</span>
          )
        }
      },
      {
        strategy: (contentBlock, callback, contentState) => {
          const regex = /(["'])(?:\\\1|.)*?\1/g
          findWithRegex(regex, contentBlock, callback)
        },
        component: (props) => {
          return (
            <span style={{
              color: 'green',
            }}>{props.children}</span>
          )
        }
      }
    ])
    this.state = {
      sqlText: [],
      editorState: EditorState.createEmpty(compositeDecorator)
    }
  }

  handleOnChange(editorState) {
    this.setState({ editorState })
  }

  handleKeyCommand(command, editorState) {
    console.log(command)
    //const newState = RichUtils.handleKeyCommand(editorState, command)
    //console.log('newState', newState)
    if (command === 'myeditor-execute') {
      console.log('execute selected')
      return 'handled'
    }
    return 'not-handled'
  }

  render() {
    return (
      <div className='App'>
        <div style={{ border: '1px solid black', padding: '10px' }}>
          <Editor
            editorState={this.state.editorState}
            handleKeyCommand={this.handleKeyCommand.bind(this)}
            onChange={this.handleOnChange.bind(this)}
            keyBindingFn={myKeyBindingFn}
          />
        </div>
        <div style={{ padding: '20px 0', textAlign: 'left' }}>
          <button onClick={() => console.log(this.state.editorState.getCurrentContent().getPlainText())}>getCurrentContent()</button>
          <button onClick={() => {
            const selectionState = this.state.editorState.getSelection()
            const currentContent = this.state.editorState.getCurrentContent()
            let startKey = selectionState.getStartKey()
            let endKey = selectionState.getEndKey()
            let currentContentBlock = currentContent.getBlockForKey(startKey)
            let selectedText = ''
            let done = false
            if (startKey === endKey) {
              selectedText = currentContentBlock.getText().slice(selectionState.getStartOffset(), selectionState.getEndOffset())
            } else {
              selectedText = currentContentBlock.getText().slice(selectionState.getStartOffset())
              while (!done) {
                startKey = currentContent.getKeyAfter(startKey)
                currentContentBlock = currentContent.getBlockForKey(startKey)
                if (startKey === endKey) {
                  done = true
                  selectedText = selectedText + '\n' + currentContentBlock.getText().slice(0, selectionState.getEndOffset())
                } else {
                  selectedText = selectedText + '\n' + currentContentBlock.getText()
                }
              }
            }
            console.log(selectedText)
          }}>getSelection()</button>
        </div>
      </div>
    )
  }
}

export default App

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText().toLowerCase();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}
const { hasCommandModifier } = KeyBindingUtil
function myKeyBindingFn(e) {
  if (e.keyCode === 13 && hasCommandModifier(e)) {
    return 'myeditor-execute'
  }
  return getDefaultKeyBinding(e)
}
function getSelectedText(startKey, startOffset, endKey, endOffset) {

}