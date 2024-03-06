import { DocumentNode, FragmentDefinitionNode, GraphQLSchema } from 'graphql'

export type TPlugin = (params: {
  documents: DocumentNode[]
  fragments?: FragmentDefinitionNode[]
  config: {
    /** 未识别字段类型映射，默认unknown */
    defaultScalarType?: string
    /** 自定义字段类型映射 */
    scalars?: Record<string, string>
  }
  schema: GraphQLSchema
}) => {
  header?: string
  content?: string
}
