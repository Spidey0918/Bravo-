// TODO
// Menu的click中的操作后续可以提取放入utils模块中
// Menu和mainWindow中的耦合比较严重，需要重构
// Bug
// 多窗口时Save一个会把所有窗口的save默认保存到同一位置

import { app, Menu, dialog, ipcMain } from 'electron'
import fs from 'fs-extra'
import { createWindow } from './mainWindow'

var markdown = '' // save the editor text 
var html = ''
var isSaved = false // check for save
var lastSavedPath = null // record last saved path for quick save
var showdown = require('showdown')
var htmlConverter = new showdown.Converter()
var { mdToPdf } = require('md-to-pdf')

// renderer->main: send editor context for save

ipcMain.on('save', (event, text) => {
  if (text !== markdown) {
    isSaved = false
  }
  markdown = text
  html = htmlConverter.makeHtml(text)

  // console.log(markdown)
})
export { markdown, isSaved }
// Customize my Menu bar
const template = [
  {
    label: app.name,
    submenu: [
      {
        label: 'About',
        click() {
          app.setAboutPanelOptions({
            applicationName: 'Bravo!',
            applicationVersion: 'v1.0.0',
            copyright: 'Produced By Haochuan Li'
          })

          app.showAboutPanel()
        }
      },
      { label: 'Exit' }
    ]
  },
  {
    label: '&File',
    submenu: [
      {
        label: 'New Window',
        click(item, focusedWindow) {
          isSaved = false
          focusedWindow = createWindow()
        }
      },
      {
        label: 'Open File...',
        click(item, focusedWindow) {
          dialog.showOpenDialog(focusedWindow, {
            properties: ['openFile'],
            filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }]
          })
            .then(result => {
              const file = result.filePaths[0];
              const filename = result.filePaths
              const fileContent = fs.readFileSync(file).toString();
              focusedWindow.title = '🟢 ' + filename
              // Send fileContent to renderer
              focusedWindow.webContents.send('open-file', fileContent)
            })
            .catch(err => {
              console.log(err)
            });
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl + S',
        click(item, focusedWindow) {
          if (!focusedWindow) {
            return dialog.showErrorBox(
              'Cannot Save or Export',
              'There is currently no active document to save or export.'
            )
          }
          if (isSaved || lastSavedPath !== null) {
            fs.writeFile(lastSavedPath, markdown, 'utf8', (err) => {
              console.log(err)
              return
            })
            focusedWindow.title = '🟢 ' + lastSavedPath
            isSaved = true
            return
          }
          dialog.showSaveDialog(focusedWindow, {
            title: 'Save Markdown',
            defaultPath: app.getPath('desktop'),
            filters: [
              { name: 'Markdown Files', extensions: ['md', 'markdown'] }
            ]
          })
            .then(result => {
              const filename = result.filePath

              if (filename === '') {
                return
              }
              focusedWindow.title = '🟢 ' + filename
              fs.writeFile(filename, markdown, 'utf8', (err) => {
                if (err) {
                  return console.log(err);
                }
                isSaved = true
                lastSavedPath = filename
                // console.log('File was saved', markdown);
              });
            })
        }
      },
      {
        label: 'Save As...',
        click(item, focusedWindow) {
          if (!focusedWindow) {
            return dialog.showErrorBox(
              'Cannot Save or Export',
              'There is currently no active document to save or export.'
            )
          }

          dialog.showSaveDialog(focusedWindow, {
            title: 'Save Markdown',
            defaultPath: app.getPath('desktop'),
            filters: [
              { name: 'Markdown Files', extensions: ['md', 'markdown'] }
            ]
          })
            .then(result => {
              const filename = result.filePath

              if (filename === '') {
                return
              }
              focusedWindow.title = '🟢 ' + filename
              fs.writeFile(filename, markdown, 'utf8', (err) => {
                if (err) {
                  return console.log(err);
                }
              });
            })

        }
      },
      {
        label: 'Export',
        submenu: [
          {
            label: 'PDF',
            accelerator: 'CmdOrCtrl+P',
            click(item, focusedWindow) {
              if (!focusedWindow) {
                return dialog.showErrorBox(
                  'Cannot Save or Export',
                  'There is currently no active document to save or export.'
                )
              }

              dialog.showSaveDialog(focusedWindow, {
                title: 'Save PDF',
                defaultPath: app.getPath('desktop'),
                filters: [
                  { name: 'PDF Files', extensions: ['pdf'] }
                ]
              })
                .then(result => {
                  const filename = result.filePath
                  if (filename === '') {
                    return
                  }
                  focusedWindow.title = '🟢 ' + filename
                  if (filename === undefined) {
                    alert('Invalid path')
                    return
                  }
                  mdToPdf({ content: markdown }, { dest: filename })
                })
            }
          },
          {
            label: 'HTML',
            accelerator: 'CmdOrCtrl+H',
            click(item, focusedWindow) {
              if (!focusedWindow) {
                return dialog.showErrorBox(
                  'Cannot Save or Export',
                  'There is currently no active document to save or export.'
                )
              }
              dialog.showSaveDialog(focusedWindow, {
                title: 'Save HTML',
                defaultPath: app.getPath('desktop'),
                filters: [
                  { name: 'HTML Files', extensions: ['html', 'htm'] }
                ]
              })
                .then(result => {
                  const filename = result.filePath
                  if (filename === '') {
                    return
                  }
                  focusedWindow.title = '🟢 ' + filename
                  if (filename === undefined) {
                    alert('Invalid path')
                    return
                  }
                  fs.writeFile(filename, html, 'utf8', err => {
                    if (err) {
                      console.log(err)
                    }
                  })
                })
            }
          }
        ]
      },
    ]
  },
  {
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]
  }
]

export default function createMenu() {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
