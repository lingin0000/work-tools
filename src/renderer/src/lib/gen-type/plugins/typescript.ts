import { FragmentDefinitionNode, Kind, visit } from 'graphql'
import { DocumentsVisitor } from '../document-visitor'
import { SelectionSetToObject } from '../selection-set-to-object'
import { VariablesToObject } from '../variables-to-object'
import { TPlugin } from './type'

/** 类型生成插件 */
const typescriptPlugin: TPlugin = ({ documents, fragments = [], config, schema }) => {
  let content = ''
  const allFragments = [
    ...fragments,
    ...documents.reduce<FragmentDefinitionNode[]>((result, documentNode) => {
      result.push(
        ...(documentNode.definitions.filter(
          (d) => d.kind === Kind.FRAGMENT_DEFINITION
        ) as FragmentDefinitionNode[])
      )
      return result
    }, [])
  ]

  const documentsVisitor = new DocumentsVisitor({
    scalars: config.scalars ?? {},
    fragments,
    schema
  })

  documentsVisitor.setVariablesToObject(
    new VariablesToObject(config.scalars ?? {}, config.defaultScalarType ?? 'unknown', schema)
  )

  documentsVisitor.setSelectionSetToObject(
    new SelectionSetToObject(
      allFragments,
      config.scalars ?? {},
      config.defaultScalarType ?? 'unknown',
      schema
    )
  )

  documents.forEach((item) => {
    content += visit(item, documentsVisitor).definitions.join('')
  })

  return {
    content
  }
}

export { typescriptPlugin }
