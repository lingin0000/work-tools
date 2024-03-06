import {
  FieldNode,
  GraphQLEnumType,
  GraphQLField,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
  GraphQLUnionType,
  isListType,
  isNonNullType,
  isObjectType,
  isScalarType,
  Kind,
  OperationDefinitionNode,
  SelectionNode,
  SelectionSetNode
} from 'graphql'
import { toUppercaseFirstLetter } from './toUppercaseFirstLetter'
import { BaseVisitor, BaseVisitorConfig } from './base-visitor'
import { DeclarationBlock } from './DeclarationBlock'
import { getOperationTypeByName } from '../graphql-action'

/** 输出类型遍历器 */
export class ClientSideVisitor<
  ClientSideVisitorConfig extends BaseVisitorConfig
> extends BaseVisitor<ClientSideVisitorConfig> {
  public FragmentDefinition(): string {
    return ''
  }

  /** 转换Operation */
  public OperationDefinition(node: OperationDefinitionNode): string {
    return this.buildOperation(
      node,
      node.operation,
      this.getVariableName(node),
      this.getResName(node)
    )
  }

  protected buildOperation(
    _node: OperationDefinitionNode,
    _operationType: string,
    _operationVariablesTypes: string,
    _operationResultType: string
  ): string {
    let content = ''
    if (_node.selectionSet) {
      content += this.buildSelectionSet(_node.selectionSet, _operationResultType)
    }

    return content
  }

  protected buildSelectionSet(selectionSet: SelectionSetNode, operationResultType: string) {
    let content = ''

    content += this.buildSelections(selectionSet.selections, operationResultType)

    return content
  }

  protected buildSelections(
    selections: readonly SelectionNode[],
    parentName: string,
    parentSchemaType?: GraphQLObjectType
  ) {
    let content = ''

    // 处理fragment
    const fieldNodes = selections.reduce<FieldNode[]>((result, cur) => {
      if (cur.kind === Kind.INLINE_FRAGMENT) {
        return result
      }
      if (cur.kind === Kind.FRAGMENT_SPREAD) {
        const fragment = this.config.fragments.find((f) => f.name.value === cur.name.value)
        if (!fragment) {
          return result
        }
        return [...result, ...(fragment.selectionSet.selections as FieldNode[])]
      }
      return [...result, cur]
    }, [])

    fieldNodes.forEach((field) => {
      const schemaField = parentSchemaType
        ? parentSchemaType.getFields()[field.name.value]
        : getOperationTypeByName(this.config.schema, field.name.value)

      if (schemaField) {
        content += this.buildField(field, parentName, schemaField)
      }
    })

    return content
  }

  protected buildField(
    field: FieldNode,
    parentName: string,
    schemaField: GraphQLField<
      Record<string, string>,
      Record<string, string>,
      Record<string, string>
    >
  ) {
    let content = ''

    if (!schemaField?.type) {
      return ''
    }

    const { baseType, isList } = this.getTypeInfo(schemaField?.type)
    let fieldName = `${parentName}${toUppercaseFirstLetter(field.alias?.value || field.name.value)}`
    let fieldContent = `NonNullable<${parentName}['${field.alias?.value || field.name.value}']>`

    if (isList) {
      fieldName += 'Item'
      fieldContent = `NonNullable<${fieldContent}[number]>`
    }

    if (isScalarType(baseType)) {
      return ''
    }

    const block = new DeclarationBlock()
    block.withCombination('=')
    block.withName(`export type ${fieldName}`)
    block.withContent(fieldContent)
    const description = schemaField.description || baseType.description
    if (description) {
      block.withComment(description)
    }
    content += `\n${block.string}`

    if (field.selectionSet?.selections && isObjectType(baseType)) {
      content += this.buildSelections(field.selectionSet.selections, fieldName, baseType)
    }

    return content
  }

  /** 获取schemaType 属性
   * @return isNonNUll 类型是否必填
   * @return isList 类型是数组
   * @return baseType 类型
   */
  protected getTypeInfo(type: GraphQLType) {
    let isNonNull = false
    let isList = false
    let innerType = type
    if (isNonNullType(innerType)) {
      innerType = innerType.ofType
      isNonNull = true
    }
    if (isListType(innerType)) {
      innerType = innerType.ofType
      isList = true
    }
    return {
      isNonNull,
      isList,
      baseType: innerType as
        | GraphQLScalarType
        | GraphQLObjectType
        | GraphQLInterfaceType
        | GraphQLUnionType
        | GraphQLEnumType
        | GraphQLInputObjectType
    }
  }
}
