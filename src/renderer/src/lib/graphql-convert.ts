import { GraphQLField, GraphQLFieldMap } from 'graphql/type/definition'
import { format } from 'prettier/standalone'
import * as prettierPluginGraphql from 'prettier/plugins/graphql'
import * as prettierPluginBabel from 'prettier/plugins/babel'
import * as prettierPluginTypescript from 'prettier/plugins/typescript'
import * as prettierPluginEstree from 'prettier/plugins/estree'
import { Options } from 'prettier'
import forEach from 'lodash/forEach'
type Item = {
  name: string
  description?: string | null
}

export type TreeItem = Item & {
  children?: TreeItem[]
}

export const loopTree2String = (tree: TreeItem[]) => {
  let result = ''
  tree.forEach((item) => {
    result += item.name
    if (item.children) {
      result += '{'
      result += '\n'
      result += loopTree2String(item.children)
      result += '\n'
      result += '}'
    }
    result += '\n'
  })
  return result
}

export const loopGraphQLFieldMap2Tree = (
  fields?: GraphQLFieldMap<any, any>,
  selected?: {
    [key: string]: {
      checked: boolean
      value: string
      key: string
      alias?: string
    }
  }
) => {
  if (!fields) {
    return []
  }
  const result: TreeItem[] = []

  forEach(selected, (item) => {
    const field = fields[item.value]
    if (!field) {
      return
    }
    const childrenFields = getFields(field)
    if (childrenFields) {
      const childrenSelected = {}
      forEach(selected, (child) => {
        if ((child.key as string).startsWith(item.key)) {
          childrenSelected[child.key] = child
        }
      })
      const _item: TreeItem = {
        name: item.alias ? `${item.alias}:${item.value}` : item.value,
        description: field.description,
        children: loopGraphQLFieldMap2Tree(childrenFields, childrenSelected)
      }
      result.push(_item)
    } else {
      const _item: TreeItem = {
        name: item.alias ? `${item.alias}:${item.value}` : item.value,
        description: field.description
      }
      result.push(_item)
    }
  })
  return result
}

export interface TreeDataItem {
  title: string
  value: string
  description: string
  children?: TreeDataItem[]
  checked?: boolean
}

export const getFields = (field: GraphQLField<any, any, any>) => {
  return (field.type as any).getFields?.() || (field.type as any).ofType?.getFields?.()
}

export const loopGraphQLFieldMap2TreeData = (
  fields?: GraphQLFieldMap<any, any>
): TreeDataItem[] => {
  if (!fields) {
    return []
  }
  const result: TreeDataItem[] = []
  for (const key in fields) {
    const field = fields[key]
    const childrenFields = getFields(field)
    if (childrenFields) {
      const item: TreeDataItem = {
        title: key,
        value: key,
        checked: false,
        description: field.description || '',
        children: loopGraphQLFieldMap2TreeData(childrenFields)
      }
      result.push(item)
    } else {
      const item: TreeDataItem = {
        title: key,
        value: key,
        description: field.description || '',
        checked: false
      }
      result.push(item)
    }
  }
  return result
}

export const prettierCode = (code: string, options?: Options) => {
  return format(code, {
    parser: 'babel',
    singleQuote: true,
    plugins: [
      prettierPluginGraphql,
      prettierPluginBabel,
      prettierPluginTypescript,
      prettierPluginEstree
    ],
    ...options
  })
}
