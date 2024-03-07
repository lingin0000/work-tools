import Dexie from 'dexie'

export interface Config {
  id: string
  name: string
  urls: string[]
  registryPath: string
  gql: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface Group {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  path: string
  configId: string
}

export interface Schema {
  id: string
  name: string
  cnName: string
  createdAt: string
  updatedAt: string
  groupId: string
  configId: string
  schemaCode: string
  typesCode: string
}

// 创建数据库类
class Database extends Dexie {
  constructor() {
    super('registry') // 数据库名称
    this.version(1).stores({
      // 定义数据库的表和索引
      config: 'id, name, urls, registryPath, gql, description, createdAt, updatedAt',
      group: 'id, name, createdAt, updatedAt, configId, path',
      schema: 'id, name, createdAt, updatedAt, groupId, configId, schemaCode, typesCode, cnName'
    })
  }
}

// 导出数据库实例
const db = new Database() as Database & {
  config: Dexie.Table<Config, string>
  group: Dexie.Table<Group, string>
  schema: Dexie.Table<Schema, string>
}
export default db
