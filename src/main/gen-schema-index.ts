import { format } from 'prettier/standalone'
import * as prettierPluginBabel from 'prettier/plugins/babel'
import * as prettierPluginTypescript from 'prettier/plugins/typescript'
import * as prettierPluginEstree from 'prettier/plugins/estree'
import { Options } from 'prettier'
import fs from 'fs'
import path from 'path'

function toUppercaseFirstLetter(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export const prettierCode = (code: string, options?: Options) => {
  return format(code, {
    parser: 'babel',
    singleQuote: true,
    plugins: [prettierPluginBabel, prettierPluginTypescript, prettierPluginEstree],
    ...options
  })
}

const genSchemaIndex = async (prefix, schemaCodePath, codeList) => {
  try {
    // 读取schemaCodePath目录
    const schemaFiles = fs.readdirSync(schemaCodePath)
    const { importSchema, importTypes, defineFunction } = schemaFiles.reduce(
      (acc, file) => {
        const name = file.split('.')[0]
        acc.importSchema += `import { ${name}Schema } from './schema/${name}';\n`
        const uppercaseName = toUppercaseFirstLetter(name)
        const ResultType = `T${uppercaseName}Res`
        const VariablesType = `T${uppercaseName}Variables`
        acc.importTypes += `import {
          ${ResultType},
          ${VariablesType}
        } from './type/${name}';\n`
        if (name.startsWith('list')) {
          acc.defineFunction += `const ${name} = useLazyQuery<${ResultType}, ${VariablesType}>(${name}Schema, { fetchPolicy: 'no-cache' })[0];\n`
        }
        if (name.startsWith('create')) {
          acc.defineFunction += `const ${name} = useMutation<${ResultType}, ${VariablesType}>(${name}Schema)[0];\n`
        }
        if (name.startsWith('update')) {
          acc.defineFunction += `const ${name} = useMutation<${ResultType}, ${VariablesType}>(${name}Schema)[0];\n`
        }
        if (name.startsWith('delete')) {
          acc.defineFunction += `const ${name} = useMutation<${ResultType}, ${VariablesType}>(${name}Schema)[0];\n`
        }
        if (name.startsWith('get')) {
          acc.defineFunction += `const ${name} = useLazyQuery<${ResultType}, ${VariablesType}>(${name}Schema, { fetchPolicy: 'no-cache' })[0];\n`
        }
        if (name.startsWith('pagedList')) {
          acc.defineFunction += `const ${name} = useLazyQuery<${ResultType}, ${VariablesType}>(${name}Schema, { fetchPolicy: 'no-cache' })[0];\n`
        }
        if (name.startsWith('batch')) {
          acc.defineFunction += `const ${name} = useMutation<${ResultType}, ${VariablesType}>(${name}Schema)[0];\n`
        }
        return acc
      },
      {
        importSchema: '',
        importTypes: '',
        defineFunction: ''
      }
    )

    const exportSchema = `const useApi = () => {
      ${defineFunction}
      return {
        ${schemaFiles
          .map((file) => {
            const name = file.split('.')[0]
            const cnName =
              codeList.find((item) => item.name === name).cnName || toUppercaseFirstLetter(name)
            return `/**${cnName} */\n ${name},`
          })
          .join('\n')}
      };
    };

    export default useApi;`
    const includesLazyQuery = defineFunction.indexOf('useLazyQuery') > -1
    const includesMutation = defineFunction.indexOf('useMutation') > -1
    let importText = ''
    if (includesLazyQuery) {
      importText = `import { useLazyQuery } from '@apollo/client';`
    }
    if (includesMutation) {
      importText = `import { useMutation } from '@apollo/client';`
    }
    if (includesLazyQuery && includesMutation) {
      importText = `import { useLazyQuery, useMutation } from '@apollo/client';`
    }
    const lastFileContent =
      importText + '\n' + importSchema + '\n\n' + importTypes + '\n\n' + exportSchema

    const _path = path.join(prefix, `/apis/index.ts`)

    const prettierContent = await prettierCode(lastFileContent, {
      parser: 'typescript'
    })
    // 写入文件
    fs.writeFileSync(_path, prettierContent, 'utf-8')
  } catch (error) {
    console.log('🚀 ~ error:', error)
  }
}

export { genSchemaIndex }
