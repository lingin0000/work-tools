import { GraphQLInputType } from 'graphql'
import { loopTree2String, TreeItem } from '../graphql-convert'

export const mutationTemplate = (
  name: string,
  args: {
    name: string
    value?: string
    type?: GraphQLInputType
  }[],
  fields: TreeItem[]
): {
  code: string
  mutation: string
} => {
  const start = 'export const ' + name + 'Schema = gql`'
  const end = '`'
  let mutationArgs = ''
  let mutationFunArgs = ''
  args.forEach((arg) => {
    mutationArgs += `$${arg.name}: ${arg.type},`
    mutationFunArgs += `${arg.name}: $${arg.name},`
  })

  if (fields.length === 0) {
    const mutation = `mutation ${name}(
      ${mutationArgs}
    ) {
      ${name}(${mutationFunArgs})
    }`

    return {
      code: start + mutation + end,
      mutation
    }
  }

  const fieldsStr = loopTree2String(fields)
  const mutation = `mutation ${name}(
    ${mutationArgs}
  ) {
    ${name}(${mutationFunArgs}) {
      ${fieldsStr}
    }
  }`
  return {
    code: start + mutation + end,
    mutation
  }
}
