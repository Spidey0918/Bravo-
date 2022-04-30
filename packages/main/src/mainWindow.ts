import { dialog, BrowserWindow, app } from 'electron';
import { join } from 'path';
import { URL } from 'url';
import createMenu, { markdown, isSaved } from './menu'
import fs from 'fs-extra'

export async function createWindow() {
  const browserWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    show: false, // Use 'ready-to-show' event to show window
    transparent: true,
    vibrancy: 'under-window',
    title: '🔴' + ' 未命名.md',
    visualEffectState: 'active',
    webPreferences: {
      nativeWindowOpen: true,
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like iframe or Electron's BrowserView. https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(__dirname, '../../preload/dist/index.cjs'),
      nodeIntegration: true,
    },
  });

  // Add Custom Menu
  createMenu()

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();

    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const pageUrl = import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
    ? import.meta.env.VITE_DEV_SERVER_URL
    : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();
  console.log(pageUrl)

  await browserWindow.loadURL(pageUrl);

  browserWindow.on('close', function(e) {
    e.preventDefault()
    if (isSaved) {
      browserWindow.destroy()
    } else {
      dialog.showMessageBox(this,
        {
          type: 'question',
          buttons: ['Quit', 'Save&Quit', 'Cancel'],
          title: 'Confirm',
          message: 'Markdown file hasn\'t been saved. Are you sure to quit?'
        })
        .then(result => {
          if (result.response === 1) {
            e.preventDefault()
            dialog.showSaveDialog(browserWindow, {
              title: 'Save Markdown',
              defaultPath: app.getPath('desktop'),
              filters: [
                { name: 'Markdown Files', extensions: ['md', 'markdown'] }
              ]
            })
              .then(result => {
                const filename = result.filePath
                fs.writeFile(filename, markdown, 'utf8', (err) => {
                  if (err) {
                    return console.log(err);
                  }
                })
                browserWindow.destroy()
              })
          }

          else if (result.response === 0) {
            browserWindow.destroy()
          }
          else {
            e.preventDefault()
          }
        })
    }
  });

  return browserWindow;
}

/**
 * Restore existing BrowserWindow or Create new BrowserWindow
 */

export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}
