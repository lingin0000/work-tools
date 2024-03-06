import generator from './generator'
import { format } from 'prettier/standalone'
import * as prettierPluginGraphql from 'prettier/plugins/graphql'
import * as prettierPluginBabel from 'prettier/parser-babel'
import * as prettierPluginTypescript from 'prettier/plugins/typescript'
import * as prettierPluginEstree from 'prettier/plugins/estree'
import { scalarsType } from './config'
const genType = async (params: Parameters<typeof generator>[number]) => {
  const type = generator({
    ...params,
    config: {
      scalars: scalarsType,
      ...params.config
    }
  })

  const prettierType = await format(type, {
    parser: 'typescript',
    singleQuote: true,
    plugins: [
      prettierPluginGraphql,
      prettierPluginBabel,
      prettierPluginTypescript,
      prettierPluginEstree
    ]
  })

  return prettierType
}

export { genType }
