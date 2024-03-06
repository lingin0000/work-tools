import { FragmentDefinitionNode, GraphQLSchema, parse } from 'graphql'
import { typescriptPlugin } from './plugins/typescript'
import { TPlugin } from './plugins/type'
import { quicklyImportPlugin } from './plugins/quicklyImport'

const generator = ({
  documents,
  ...params
}: {
  documents: string[]
  fragments?: FragmentDefinitionNode[]
  config: {
    /** 未识别字段类型映射，默认unknown */
    defaultScalarType?: string
    /** 自定义字段类型映射 */
    scalars?: Record<string, string>
  }
  schema: GraphQLSchema
}): string => {
  /** 插件集合 */
  const plugins: TPlugin[] = [typescriptPlugin, quicklyImportPlugin]

  /** 遍历执行插件，合并内容 */
  const { header, content } = plugins.reduce<{
    header: string[]
    content: string[]
  }>(
    (result, plugin) => {
      const _headers = result.header
      const _contents = result.content
      const { header, content } = plugin({
        ...params,
        documents: documents?.map((str) => parse(str)) ?? []
      })
      if (header) {
        _headers.push(header)
      }
      if (content) {
        _contents.push(content)
      }

      return {
        header: _headers,
        content: _contents
      }
    },
    {
      header: [],
      content: []
    }
  )
  /** 生成内容 */
  return [header.join('\n'), content.join('\n')].join('\n')
}

export default generator
