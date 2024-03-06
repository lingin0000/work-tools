import type { GraphQLSchema } from 'graphql'

/**
 * @description: 根据 mutation名字 搜索schema源中 mutation类型
 * @param {GraphQLSchema} schema schema源
 * @param {string} name mutation 名字
 * @return {*} mutation 类型
 */
export const getMutationTypeByName = (schema: GraphQLSchema, name: string) => {
  return schema.getMutationType()?.getFields()?.[name]
}

export const getMutationType = (schema: GraphQLSchema) => {
  return schema.getMutationType()?.getFields()
}

/**
 * @description: 根据 query名字 搜索schema源中 query类型
 * @param {GraphQLSchema} schema schema源
 * @param {string} name query 名字
 * @return {*} query 类型
 */
export const getQueryTypeByName = (schema: GraphQLSchema, name: string) => {
  return schema.getQueryType()?.getFields()?.[name]
}

export const getQueryType = (schema: GraphQLSchema) => {
  return schema.getQueryType()?.getFields()
}

export const getSubscriptionType = (schema: GraphQLSchema) => {
  return schema.getSubscriptionType()?.getFields()
}

/**
 * @description: 根据 操作名字 搜索schema源中 操作类型 （操作类型优先搜索query，后搜索mutation）
 * @param {GraphQLSchema} schema schema源
 * @param {string} name 操作 名字
 * @return {*} 操作 类型
 */
export const getOperationTypeByName = (schema: GraphQLSchema, name: string) => {
  return getQueryTypeByName(schema, name) || getMutationTypeByName(schema, name)
}
