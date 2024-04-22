import { ipcMain, shell } from 'electron'

export function openBrowser() {
  ipcMain.on('open-browser', (event, arg) => {
    try {
      const { url } = arg
      shell.openExternal(url)
      event.reply('open-browser-reply', { success: true, result: true })
    } catch (e) {
      event.reply('open-browser-reply', { success: false, message: (e as any).message })
    }
  })
}
