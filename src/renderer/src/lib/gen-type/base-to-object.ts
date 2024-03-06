/*
 * @Author: 罗智刚
 * @Description: 基础转换类
 * @Date: 2022-12-30 19:19:21
 */
import {
  GraphQLSchema,
  GraphQLEnumType,
  GraphQLScalarType,
  GraphQLInputObjectType,
  GraphQLType,
  GraphQLObjectType,
  isNonNullType,
  isListType,
  GraphQLInterfaceType,
  GraphQLUnionType
} from 'graphql'
import { DeclarationBlock } from './DeclarationBlock'

/** 基础转换类 */
export class BaseToObject {
  /** scalar类型映射 */
  private _scalars: Record<string, string>

  /** 获取 scalar类型映射 */
  public get scalars() {
    return this._scalars
  }

  /** 默认scalar类型 */
  private _defaultScalarType: string

  /** 获取 默认scalar类型 */
  public get defaultScalarType() {
    return this._defaultScalarType
  }

  /** 数据源 */
  private _schema: GraphQLSchema

  /** 获取 数据源 */
  public get schema() {
    return this._schema
  }

  constructor(
    /** scalar类型映射 */
    scalars: Record<string, string>,
    /** 默认scalar类型 */
    defaultScalarType: string,
    /** 数据源 */
    schema: GraphQLSchema
  ) {
    this._scalars = scalars
    this._defaultScalarType = defaultScalarType
    this._schema = schema
  }

  /** 根据scalar name 返回对应类型映射值 */
  protected getScalarByName(name: string) {
    return this._scalars?.[name]
  }

  /** 转换类型 */
  public transform(): {
    exportType?: string
    contentType?: string
  } {
    throw new Error('请先继承实现transform方法')
  }

  /** 转换Scalar类型 */
  protected transformScalarType(type: GraphQLScalarType) {
    return this._scalars[type.name] ?? this._defaultScalarType
  }

  /** 转换Enum类型 union格式 */
  protected transformEnumToUnionType(type: GraphQLEnumType) {
    return type
      .getValues()
      .map((value) => value.value)
      .join('|')
  }

  /** 转换Enum类型 enum格式 */
  protected transformEnumToEnumType(type: GraphQLEnumType) {
    const content = type
      .getValues()
      .map(({ name, value, description }) => {
        return new DeclarationBlock()
          .withName(name)
          .withContent(typeof value === 'string' ? `"${value}"` : value)
          .withComment(description ?? '')
          .withCombination('=')
          .withPunctuation(',').string
      })
      .join('\n')

    return `{\n${content}\n}`
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

  /** 根据名称获取数据源中类型 */
  protected getSchemaType(name: string) {
    return this._schema.getType(name)
  }
}
