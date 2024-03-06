import {
  TypeNode,
  VariableDefinitionNode,
  Kind,
  GraphQLNamedType,
  isScalarType,
  GraphQLType,
  isEnumType,
  isInputObjectType,
  GraphQLInputObjectType
} from 'graphql'
import { DeclarationBlock } from './DeclarationBlock'
import { BaseToObject } from './base-to-object'

/** Variables构建类 */
export class VariablesToObject extends BaseToObject {
  private globalType: Map<string, { status: 'pending' | 'success'; type?: string }> = new Map()

  /** 转换入参类型 */
  public transform(variableDefinitionNode: VariableDefinitionNode) {
    const variableType = this.getVariableSchemaType(variableDefinitionNode.type)

    if (!variableType) {
      return { contentType: '', exportType: '' }
    }

    // 入参类型
    const contentType = this.buildVariableType(
      variableType.isRequired,
      variableType.isList,
      variableDefinitionNode.variable.name.value,
      variableType.type
    )

    const exportType = [...Array.from(this.globalType.values())]
      .map((v) => v.type)
      .filter(Boolean)
      .join('\n\n')

    this.globalType.clear()

    return {
      exportType,
      contentType
    }
  }

  /** 构建入参类型 */
  protected buildVariableType(
    isRequired: boolean,
    isList: boolean,
    variableName: string,
    type: GraphQLNamedType
  ) {
    const block = new DeclarationBlock()
      .withName(variableName)
      .withRequire(isRequired)
      .withContent(`${this.buildType(type)}${isList ? '[]' : ''}`)

    if (!isScalarType(type)) {
      block.withComment(type.description ?? '')
    }
    return block.string
  }

  /** 构建类型 */
  protected buildType(type: GraphQLType) {
    if (isScalarType(type)) {
      return this.transformScalarType(type)
    }
    if (isEnumType(type)) {
      if (!this.globalType.has(type.name)) {
        const eunmTypeBlock = new DeclarationBlock()
          .withName(`export enum ${type.name}`)
          .withCombination('')
          .withContent(this.transformEnumToEnumType(type))

        if (type.description) {
          eunmTypeBlock.withComment(type.description)
        }
        this.globalType.set(type.name, {
          status: 'success',
          type: eunmTypeBlock.string
        })
      }
      return type.name
    }
    if (isInputObjectType(type)) {
      if (!this.globalType.has(type.name)) {
        this.globalType.set(type.name, { status: 'pending' })
        const objectBlock = new DeclarationBlock()
          .withName(`export type ${type.name}`)
          .withCombination('=')
          .withContent(this.transformObjectType(type))

        if (type.description) {
          objectBlock.withComment(type.description)
        }
        this.globalType.set(type.name, {
          status: 'success',
          type: objectBlock.string
        })
      }
      return type.name
    }

    return ''
  }

  /** 转换object类型 */
  protected transformObjectType(type: GraphQLInputObjectType) {
    const fields = Object.values(type.getFields())

    return `{${fields.reduce((result, field) => {
      const fieldBlock = new DeclarationBlock()
      const fieldTypeInfo = this.getTypeInfo(field.type)

      if (field.description) {
        fieldBlock.withComment(field.description)
      }

      const content = this.globalType.has(field.name)
        ? field.name
        : this.buildType(fieldTypeInfo.baseType)

      fieldBlock
        .withName(field.name)
        .withRequire(fieldTypeInfo.isNonNull)
        .withContent(`${content}${fieldTypeInfo.isList ? '[]' : ''}`)

      return `${result}\n${fieldBlock.string}`
    }, '')}
      }`
  }

  /** 获取对应数据源中的shcema类型 */
  protected getVariableSchemaType(typeNode: TypeNode) {
    let isRequired = false
    let isList = false
    let nameType = typeNode

    if (nameType.kind === Kind.NON_NULL_TYPE) {
      nameType = nameType.type
      isRequired = true
    }

    if (nameType.kind === Kind.LIST_TYPE) {
      nameType = nameType.type
      isList = true
    }
    if (nameType.kind !== Kind.NAMED_TYPE) {
      return null
    }

    const type = this.schema.getType(nameType.name.value)

    if (!type) {
      return null
    }

    return {
      isRequired,
      isList,
      type
    }
  }
}
