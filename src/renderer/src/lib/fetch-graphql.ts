import axios from 'axios'
import { buildClientSchema } from 'graphql'
import type {
  GraphQLSchema,
  IntrospectionObjectType,
  IntrospectionQuery,
  IntrospectionType
} from 'graphql'
export interface DataSource {
  schema: GraphQLSchema
}

class RequestGraphql {
  private directives: IntrospectionQuery['__schema']['directives']

  private mutationType: IntrospectionQuery['__schema']['mutationType']

  private queryType: IntrospectionQuery['__schema']['queryType']

  private subscriptionType: IntrospectionQuery['__schema']['subscriptionType']

  private description: IntrospectionQuery['__schema']['description']

  private types: IntrospectionQuery['__schema']['types']

  private schemaMap: Record<string, DataSource>

  private params: {
    operationName: 'IntrospectionQuery'
    query: string
  }

  constructor() {
    this.directives = []
    this.mutationType = {} as any
    this.queryType = {} as any
    this.subscriptionType = {} as any
    this.description = null
    this.types = []
    this.schemaMap = {}
    this.params = {
      operationName: 'IntrospectionQuery',
      query:
        '\n    query IntrospectionQuery {\n      __schema {\n        description\n        queryType { name\n kind }\n        mutationType { name\n kind }\n        subscriptionType { name\n kind }\n        types {\n          ...FullType\n        }\n        directives {\n          name\n          description\n          \n          locations\n          args {\n            ...InputValue\n          }\n        }\n      }\n    }\n\n    fragment FullType on __Type {\n      kind\n      name\n      description\n      \n      fields(includeDeprecated: true) {\n        name\n        description\n        args {\n          ...InputValue\n        }\n        type {\n          ...TypeRef\n        }\n        isDeprecated\n        deprecationReason\n      }\n      inputFields {\n        ...InputValue\n      }\n      interfaces {\n        ...TypeRef\n      }\n      enumValues(includeDeprecated: true) {\n        name\n        description\n        isDeprecated\n        deprecationReason\n      }\n      possibleTypes {\n        ...TypeRef\n      }\n    }\n\n    fragment InputValue on __InputValue {\n      name\n      description\n      type { ...TypeRef }\n      defaultValue\n      \n      \n    }\n\n    fragment TypeRef on __Type {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  '
    }
  }

  private getOneSchema = async (path: string) => {
    const { data } = await axios({
      url: path,
      method: 'POST',
      data: {
        operationName: 'IntrospectionQuery',
        query:
          '\n    query IntrospectionQuery {\n      __schema {\n        description\n        queryType { name\n kind }\n        mutationType { name\n kind }\n        subscriptionType { name\n kind }\n        types {\n          ...FullType\n        }\n        directives {\n          name\n          description\n          \n          locations\n          args {\n            ...InputValue\n          }\n        }\n      }\n    }\n\n    fragment FullType on __Type {\n      kind\n      name\n      description\n      \n      fields(includeDeprecated: true) {\n        name\n        description\n        args {\n          ...InputValue\n        }\n        type {\n          ...TypeRef\n        }\n        isDeprecated\n        deprecationReason\n      }\n      inputFields {\n        ...InputValue\n      }\n      interfaces {\n        ...TypeRef\n      }\n      enumValues(includeDeprecated: true) {\n        name\n        description\n        isDeprecated\n        deprecationReason\n      }\n      possibleTypes {\n        ...TypeRef\n      }\n    }\n\n    fragment InputValue on __InputValue {\n      name\n      description\n      type { ...TypeRef }\n      defaultValue\n      \n      \n    }\n\n    fragment TypeRef on __Type {\n      kind\n      name\n      ofType {\n        kind\n        name\n        ofType {\n          kind\n          name\n          ofType {\n            kind\n            name\n            ofType {\n              kind\n              name\n              ofType {\n                kind\n                name\n                ofType {\n                  kind\n                  name\n                  ofType {\n                    kind\n                    name\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  '
      }
    })
    if (data?.data?.__schema) {
      const { __schema } = data.data

      const { queryType, mutationType, subscriptionType, types, directives } = __schema
      this.queryType = { ...this.queryType, ...queryType }
      this.mutationType = { ...this.mutationType, ...mutationType }
      this.subscriptionType = {
        ...this.subscriptionType,
        ...subscriptionType
      }
      this.types = [...this.types, ...types]
      this.directives = [...this.directives, ...directives]
      this.description = __schema.description

      let schema
      try {
        schema = buildClientSchema({
          __schema
        })
      } catch (e) {
        return { error: '解析出错', url: path, schema: undefined }
      }
      return {
        schema,
        error: false
      }
    } else {
      return { error: '请求出错', url: path, schema: undefined }
    }
  }

  /**
   * @description: 获取数据源
   * @param {string} path gql数据源地址
   * @return {*} {source: 原始数据源 , schema: 标准化GraphQLSchema}
   */
  public genSource = async (paths: string[]) => {
    for (const path of paths) {
      const { error, schema } = await this.getOneSchema(path)
      if (!error && schema) {
        this.schemaMap[path] = { schema }
      }
    }

    /**
     * 下方合并去重规则均为后重复项覆盖前者
     */
    /** 合并去除同名types */
    const indexMap = new Map<string, number>()
    this.types = this.types.reduce((result, item, index) => {
      const itemName = item.name
      if (indexMap.has(itemName)) {
        const existIndex = indexMap.get(itemName)!
        switch (itemName) {
          case 'Query':
          case 'Mutation':
            /** 合并Query Mutation 里面的fields，并去重 */
            const existItem = result[existIndex] as IntrospectionObjectType
            const curItem = item as IntrospectionObjectType
            result[existIndex] = {
              ...item,
              fields: existItem.fields.reduce((result, item) => {
                if (result.some((i) => i.name === item.name)) {
                  return result
                }
                return [...result, item]
              }, curItem.fields ?? [])
            } as IntrospectionObjectType
            return result
          default:
            result[existIndex] = item
            return result
        }
      }
      indexMap.set(itemName, index)
      return [...result, item]
    }, [] as IntrospectionType[])

    const __source = {
      __schema: {
        description: this.description,
        queryType: this.queryType,
        mutationType: this.mutationType,
        subscriptionType:
          Object.keys(this.subscriptionType as object).length === 0 ? null : this.subscriptionType,
        types: this.types,
        directives: this.directives
      }
    }
    let mergeSchema
    try {
      mergeSchema = buildClientSchema(__source, {
        assumeValid: true
      })
    } catch {
      return {
        error: '解析出错',
        schemaMap: this.schemaMap,
        mergeSchema: undefined
      }
    }
    return {
      schemaMap: this.schemaMap,
      mergeSchema,
      error: false
    }
  }
}

export default RequestGraphql
