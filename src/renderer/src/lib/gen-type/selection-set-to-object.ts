/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FragmentDefinitionNode,
  FragmentSpreadNode,
  isEnumType,
  isObjectType,
  GraphQLObjectType,
  GraphQLSchema,
  InlineFragmentNode,
  isScalarType,
  Kind,
  SelectionSetNode,
  SelectionNode,
  GraphQLField
} from 'graphql'
import { DeclarationBlock } from './DeclarationBlock'
import { BaseToObject } from './base-to-object'
import { getOperationTypeByName } from '../graphql-action'

/** Selection构建类 */
export class SelectionSetToObject extends BaseToObject {
  private _fragments: FragmentDefinitionNode[] = []

  constructor(
    /** 文本片段 */
    fragments: FragmentDefinitionNode[],
    /** 类型映射 */
    scalars: Record<string, string>,
    /** 默认类型 */
    defaultScalarType: string,
    /** 数据源 */
    schema: GraphQLSchema
  ) {
    super(scalars, defaultScalarType, schema)
    this._fragments = fragments
  }

  /** 转换Selection节点 */
  public transform(node: SelectionSetNode, parentSchemaType?: GraphQLObjectType) {
    return {
      contentType: `{${this.transformSelectionSet(node, parentSchemaType).join('')}}`
    }
  }

  /** 转换selectionSet内容 */
  transformSelectionSet(node: SelectionSetNode, parentSchemaType?: GraphQLObjectType): string[] {
    return node.selections.reduce<string[]>((result, selection) => {
      // 字段
      if (selection.kind === Kind.FIELD) {
        // 根节点
        if (!parentSchemaType) {
          const schemaField = getOperationTypeByName(this.schema, selection.name.value)
          if (!schemaField) {
            throw new Error(
              `数据源中，不存在 ${selection.name.value} 对应类型，请检查schema或数据源`
            )
          }
          return [...result, `\n${this.transformSelection(selection, schemaField)}`]
        }

        // 子节点
        if (parentSchemaType) {
          const field = parentSchemaType.getFields()?.[selection.name.value]
          if (!field) {
            throw new Error(
              `类型 ${parentSchemaType.name} 中，不存在 ${selection.name.value}，请检查schema`
            )
          }
          return [...result, `\n${this.transformSelection(selection, field)}`]
        }
      } else {
        // fragment
        return [...result, ...this.transformFragmentSelectionSet(selection, parentSchemaType)]
      }
      return result
    }, [])
  }

  /** 转换selection内容 */
  transformSelection(selection: SelectionNode, field: GraphQLField<any, any, any>) {
    if (selection.kind !== Kind.FIELD) {
      return ''
    }

    const { type } = field
    const { isNonNull, baseType, isList } = this.getTypeInfo(type)

    const block = new DeclarationBlock()
      .withName(selection.alias?.value || selection.name.value)
      .withRequire(isNonNull)

    const listStr = isList ? '[]' : ''

    if (isScalarType(baseType)) {
      block.withContent(this.transformScalarType(baseType) + listStr)
    }
    if (isEnumType(baseType)) {
      block.withContent(this.transformEnumToUnionType(baseType) + listStr)
    }

    if (isObjectType(baseType)) {
      const { selectionSet } = selection
      if (!selectionSet) {
        throw new Error(`${selection.name.value} 下未声明子字段，请检查schema`)
      }
      block.withContent(this.transform(selectionSet, baseType).contentType + listStr)
    }

    let description = field.description || baseType.description
    if (description) {
      if (selection.alias?.value) {
        description = `原字段名${selection.name.value}; ${description}`
      }
      block.withComment(description)
    }
    return block.string
  }

  /** 转换selection中的fragment内容 */
  transformFragmentSelectionSet(
    node: FragmentSpreadNode | InlineFragmentNode,
    parentSchemaType?: GraphQLObjectType
  ) {
    if (node.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = this._fragments.find((f) => f.name.value === node.name.value)
      if (fragment?.selectionSet) {
        return this.transformSelectionSet(fragment?.selectionSet, parentSchemaType)
      }
      return []
    }
    return []
  }
}
