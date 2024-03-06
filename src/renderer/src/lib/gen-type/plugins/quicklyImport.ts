import { FragmentDefinitionNode, Kind, visit } from 'graphql'
import { ClientSideVisitor } from '../client-side-visitor'
import { TPlugin } from './type'

/** 快速导出类型节点 */
const quicklyImportPlugin: TPlugin = ({ documents, fragments = [], config, schema }) => {
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

  const clientSideVisitor = new ClientSideVisitor({
    scalars: config.scalars ?? {},
    fragments: allFragments,
    schema
  })

  documents.forEach((item) => {
    content += visit(item, clientSideVisitor).definitions.join('')
  })

  return {
    content
  }
}

export { quicklyImportPlugin }
