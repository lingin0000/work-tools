/*
 * @Author: 罗智刚
 * @Description: 基础遍历器
 * @Date: 2022-12-30 17:02:00
 */
import { FragmentDefinitionNode, GraphQLSchema, OperationDefinitionNode } from 'graphql'
import { toUppercaseFirstLetter } from './toUppercaseFirstLetter'

/** 基础遍历器config */
export type BaseVisitorConfig = {
  /** 类型映射 */
  scalars: Record<string, string>
  /** 数据源 */
  schema: GraphQLSchema
  /** 片段集合 */
  fragments: FragmentDefinitionNode[]
}

/** 基础遍历器 */
export class BaseVisitor<T extends BaseVisitorConfig> {
  /** 基础遍历器config */
  private _config: T

  /** 基础遍历器config */
  get config() {
    return this._config
  }

  constructor(config: T) {
    this._config = config
  }

  /** 根据名称获取数据源中类型 */
  protected getSchemaType(name: string) {
    return this.config.schema.getType(name)
  }

  /** 获取文本节点命名 */
  protected getFragmentName(node: FragmentDefinitionNode) {
    return `T${toUppercaseFirstLetter(node.name.value)}Fragment`
  }

  /** 获取入参节点命名 */
  protected getVariableName(node: OperationDefinitionNode) {
    return `T${toUppercaseFirstLetter(node.name!.value)}Variables`
  }

  /** 获取出参节点命名 */
  protected getResName(node: OperationDefinitionNode) {
    return `T${toUppercaseFirstLetter(node.name!.value)}Res`
  }
}
