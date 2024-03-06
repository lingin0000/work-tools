import { FragmentDefinitionNode, isObjectType, OperationDefinitionNode } from 'graphql'
import { BaseVisitor, BaseVisitorConfig } from './base-visitor'
import { SelectionSetToObject } from './selection-set-to-object'
import { VariablesToObject } from './variables-to-object'

/** 文档遍历器 */
export class DocumentsVisitor<
  DocumentVisitorConfig extends BaseVisitorConfig
> extends BaseVisitor<DocumentVisitorConfig> {
  private _variableToObject: VariablesToObject | undefined

  private _selectionSetToObject: SelectionSetToObject | undefined

  /** 设置入参构建类 */
  public setVariablesToObject(variableToObject: VariablesToObject) {
    this._variableToObject = variableToObject
  }

  /** 设置Selection构建类 */
  public setSelectionSetToObject(selectionSetToObject: SelectionSetToObject) {
    this._selectionSetToObject = selectionSetToObject
  }

  /** 转换Fragment */
  public FragmentDefinition(node: FragmentDefinitionNode): string {
    const type = this.getSchemaType(node.typeCondition.name.value)
    if (!type) {
      throw new Error(`数据源中不存在类型${node.typeCondition.name.value}`)
    }

    if (!isObjectType(type)) {
      throw new Error(`${node.typeCondition.name.value} 不是一个object type，无法满足片段语法`)
    }

    const fragmentBlock = this?._selectionSetToObject?.transform(
      node.selectionSet,
      type
    ).contentType

    if (fragmentBlock) {
      const name = this.getFragmentName(node)
      return this.applyFragmentWrapper(name, fragmentBlock)
    }
    return ''
  }

  /** 转换Operation */
  public OperationDefinition(node: OperationDefinitionNode): string {
    const exportTypes = new Set<string>()
    const types = new Set<string>()

    /** 入参开始 */
    const variablesBlock = node.variableDefinitions
      ?.map((d) => {
        const { exportType, contentType } = this?._variableToObject?.transform(d) ?? {}
        if (exportType) {
          exportTypes.add(exportType)
        }
        return contentType
      })
      .join('\n')

    if (variablesBlock) {
      const name = this.getVariableName(node)
      types.add(this.applyVariablesWrapper(name, `{${variablesBlock}}`))
    }
    /** 入参结束 */

    /** 出参开始 */
    const selectionsSetBlock = this?._selectionSetToObject?.transform(
      node.selectionSet
    )?.contentType

    if (selectionsSetBlock) {
      const name = this.getResName(node)
      types.add(this.applySelectionsWrapper(name, selectionsSetBlock))
    }
    /** 出参结束 */

    /** 输出结果 */
    return [...Array.from(exportTypes.values()), ...Array.from(types.values())].join('\n')
  }

  /** 提供入参包裹层 */
  protected applyVariablesWrapper(variablesName: string, variablesBlock: string): string {
    return `export type ${variablesName} = ${variablesBlock}`
  }

  /** 提供出参包裹层 */
  protected applySelectionsWrapper(selectionsName: string, selectionsBlock: string): string {
    return `export type ${selectionsName} = ${selectionsBlock}`
  }

  /** 提供片段包裹层 */
  protected applyFragmentWrapper(fragmentName: string, fragmentBlock: string): string {
    return `export type ${fragmentName} = ${fragmentBlock}`
  }
}
