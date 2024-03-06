import { ipcMain } from 'electron'
import xml2js from 'xml2js'
import yaml from 'yaml'

const builder = new xml2js.Builder()

function json2xml() {
  ipcMain.on('json2xml', (event, arg) => {
    const { jsonDocument } = arg
    const result = builder.buildObject(jsonDocument)
    event.reply('json2xml-reply', { success: true, result })
  })
}

function json2yaml() {
  ipcMain.on('json2yaml', (event, arg) => {
    const { jsonDocument } = arg
    const result = yaml.stringify(jsonDocument)
    event.reply('json2yaml-reply', { success: true, result })
  })
}

export { json2xml, json2yaml }
