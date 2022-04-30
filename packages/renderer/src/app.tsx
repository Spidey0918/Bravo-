import React, { useState, useCallback } from 'react'
import Editor from './editor-panel/editor'
import './app.css'
import Preview from './preview-panel/preview'

const App: React.FC = () => {
  const [doc, setDoc] = useState<string>('# Hello, World!!!\n')

  const handleDocChange = useCallback(newDoc => {
    //   console.log('hello docChange')
    window.electronAPI.saveFile(newDoc)
    setDoc(newDoc)
  }, [])
  console.log('why\n ' + doc + '\n not change')

  return (
    //    console.log('hello return'),
    <div className='app'>
      <div className='editor'>
        <Editor onChange={handleDocChange} initialDoc={doc} />
      </div>

      <div className='preview'>
        <Preview doc={doc} />
      </div>

    </div>
  )
}

export default App
