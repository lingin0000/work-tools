import { ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { genSchemaIndex } from './gen-schema-index'
/**
 * 生成graphql代码
 */
function graphqlGenerator() {
  ipcMain.on('graphql-generator', (event, arg) => {
    // 在这里处理 POST 请求
    const { prefix, codeList, schemaCodePath, typesCodePath } = arg // 从请求中获取数据
    // 先创建apis/schema目录
    try {
      const _path = path.join(prefix, schemaCodePath)
      if (!fs.existsSync(_path)) {
        fs.mkdirSync(_path, { recursive: true })
      }

      // 创建apis/type目录
      const _typePath = path.join(prefix, typesCodePath)
      if (!fs.existsSync(_typePath)) {
        fs.mkdirSync(_typePath, { recursive: true })
      }
      codeList.forEach((item: { name: string; schemaCode: string; typesCode: string }) => {
        const { name, schemaCode, typesCode } = item
        const _schemaCodePath = path.join(prefix, schemaCodePath, name)
        const _typesCodePath = path.join(prefix, typesCodePath, name)
        fs.writeFileSync(`${_schemaCodePath}.ts`, schemaCode, 'utf-8')
        fs.writeFileSync(`${_typesCodePath}.ts`, typesCode, 'utf-8')
      })
      genSchemaIndex(prefix, path.join(prefix, schemaCodePath), codeList)

      event.reply('graphql-generator-reply', { success: true })
    } catch (e) {
      event.reply('graphql-generator-reply', { success: false, message: (e as any).message })
    }
  })
}

function getFolder() {
  ipcMain.on('get-folder', (event, arg) => {
    const { registryPath, extraPath } = arg
    const _path = path.join(registryPath, extraPath)
    // 读取目录
    const files = fs.readdirSync(_path)
    const dirs = files.filter((item) => {
      return fs.statSync(path.join(_path, item)).isDirectory()
    })
    const result = dirs.map((item) => {
      return {
        name: item,
        path: path.join(_path, item)
      }
    })
    event.reply('get-folder-reply', { success: true, result })
  })
}

export { graphqlGenerator, getFolder }
