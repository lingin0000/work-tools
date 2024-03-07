/**
 *@description:
 *@author: 孙宇林
 *@date: 2024-02-07 10:46:18
 **/
import Switcher from './switcher'
import { Args } from './args'
import { Fields } from './fields'
import { Fragment, useEffect, useState } from 'react'
import { GraphQLArgument, GraphQLFieldMap, GraphQLInputType } from 'graphql'
import { CodePreview } from './code-preview'
import { Button } from '@/components/ui/button'
import FragmentList, { FragmentListProps } from './fragment-list'
import { queryTemplate } from '@/lib/templates/queryTemplate'
import { mutationTemplate } from '@/lib/templates/mutationTemplate'
import {
  getFields,
  loopGraphQLFieldMap2Tree,
  loopGraphQLFieldMap2TreeData,
  loopTree2String,
  prettierCode
} from '@/lib/graphql-convert'

import { nanoid } from 'nanoid'

import { Config } from '@/lib/db'
import { genType } from '@/lib/gen-type'
import { GraphqlOptionsProps } from '../index'
import { useForm } from 'react-hook-form'
import { useDataSource } from '@/store/graphql'
import { useToast } from '@/components/ui/use-toast'
import { useGraphql } from '@/store/graphql'

export interface Arg {
  name: string
  value: string
  type?: GraphQLInputType
}

export function GenCode({
  options,
  graphQLFields,
  type,
  config
}: {
  options: GraphqlOptionsProps[]
  graphQLFields?: GraphQLFieldMap<any, any>
  type: 'query' | 'mutation' | 'subscription'
  config?: Config
}) {
  const form = useForm({})
  const { toast } = useToast()
  const { configId } = useGraphql()
  const { mergeSchema } = useDataSource()
  const [schemaCode, setSchemaCode] = useState<string>('')
  const [typesCode, setTypesCode] = useState<string>('')
  const [graphQLFieldData, setGraphQLFieldData] = useState<{
    args: ReadonlyArray<GraphQLArgument>
    fields: GraphQLFieldMap<any, any>
    description?: string | null
  }>()
  const [functionName, setFunctionName] = useState<string>('')
  const [cnFunctionName, setCnFunctionName] = useState<string>('')
  const [actionType, setActionType] = useState<'single' | 'multiple'>()
  const [multiFunctionName, setMultiFunctionName] = useState<string>('')
  const [multiCnFunctionName, setMultiCnFunctionName] = useState<string>('')

  const [selectedFields, setSelectedFields] = useState<{
    [key: string]: {
      checked: boolean
      value: string
      alias?: string
    }
  }>({})

  const [fragments, setFragments] = useState<FragmentListProps['dataSource']>([])

  // 获取参数和字段
  const getArgAndFields = () => {
    const args: Arg[] = []
    Object.entries(form.getValues())
      .map(([key, value]) => {
        if (value.checked) {
          const target = graphQLFieldData?.args.find((arg) => arg.name === key)
          args.push({
            name: value.rename || key,
            value: value.value,
            type: target?.type
          })
        }
      })
      .filter(Boolean)
    const fields = loopGraphQLFieldMap2Tree(graphQLFieldData?.fields, selectedFields)
    return {
      args,
      fields
    }
  }

  const handleGenCode = async () => {
    const { args, fields } = getArgAndFields()
    let _code = `import { gql } from "${config?.gql}";\n\n`
    if (type === 'query') {
      const { query, code } = queryTemplate(functionName, args, fields)
      _code += code
      try {
        const _typesCode = await genType({
          documents: [query],
          schema: mergeSchema,
          config: {}
        })
        setTypesCode(_typesCode)
      } catch (e) {
        toast({
          title: '生成失败',
          description: (e as Error).message,
          variant: 'destructive'
        })
      }
    }
    if (type === 'mutation') {
      const { mutation, code } = mutationTemplate(functionName, args, fields)

      _code += code
      try {
        const _typesCode = await genType({
          documents: [mutation],
          schema: mergeSchema,
          config: {}
        })
        setTypesCode(_typesCode)
      } catch (error) {
        toast({
          title: '生成失败',
          description: (error as Error).message,
          variant: 'destructive'
        })
      }
    }

    const prettierEdCode = await prettierCode(_code)
    setSchemaCode(prettierEdCode)
    setActionType('single')
  }

  const handleGenCodes = async (
    documents: string[],
    code: string,
    _functionName: string,
    _cnFunctionName: string
  ) => {
    let _code = `import { gql } from "${config?.gql}";\n\n`
    _code += code
    const prettierEdCode = await prettierCode(_code)
    const _typesCode = await genType({
      documents,
      schema: mergeSchema,
      config: {}
    })
    setSchemaCode(prettierEdCode)
    setMultiFunctionName(_functionName)
    setMultiCnFunctionName(_cnFunctionName)
    setActionType('multiple')
    setTypesCode(_typesCode)
  }

  const handleChange = (value: string, label: string) => {
    setFunctionName(value)
    setCnFunctionName(label)
    const field = graphQLFields?.[value]
    if (!field) return
    setGraphQLFieldData({
      args: field.args,
      fields: getFields(field),
      description: field.description
    })
  }

  const handleAddGqlList = () => {
    const { fields, args } = getArgAndFields()
    const gqlFragment = loopTree2String(fields)
    setFragments((prev) => {
      return [
        ...prev,
        {
          functionName,
          fragment: gqlFragment,
          args: args,
          fields: fields,
          id: nanoid()
        }
      ]
    })
  }

  const handleDeleteFragment = (id: string) => {
    setFragments((prev) => {
      return prev.filter((item) => item.id !== id)
    })
  }

  useEffect(() => {
    setSchemaCode('')
    setTypesCode('')
    setFunctionName('')
    setMultiFunctionName('')
    setActionType(undefined)
    setFragments([])
    setSelectedFields({})
    setGraphQLFieldData(undefined)
    setMultiCnFunctionName('')
    setCnFunctionName('')
  }, [configId])

  return (
    <Fragment>
      <div className=" flex-1">
        <div className="flex gap-4 align-middle">
          <Switcher options={options} value={functionName} onChange={handleChange} />
          <Button disabled={!functionName} onClick={handleGenCode}>
            生成代码
          </Button>
          <Button disabled={!functionName} onClick={handleAddGqlList}>
            添加到列表
          </Button>
        </div>
        <div className="flex gap-4 mb-4 mt-4">
          <Args dataSource={graphQLFieldData?.args} type={type} form={form} />
          <Fields
            dataSource={loopGraphQLFieldMap2TreeData(graphQLFieldData?.fields)}
            onChange={(data) => {
              const _selectedFields = data.reduce(
                (acc, cur) => {
                  acc[cur.value] = {
                    checked: true,
                    value: cur.value,
                    alias: cur.alias
                  }
                  return acc
                },
                {} as {
                  [key: string]: {
                    checked: boolean
                    value: string
                    alias?: string
                  }
                }
              )
              setSelectedFields(_selectedFields)
            }}
          />
        </div>
        <FragmentList
          dataSource={fragments}
          onDelete={handleDeleteFragment}
          onGenCode={handleGenCodes}
        />
      </div>
      <CodePreview
        schemaCode={schemaCode}
        typesCode={typesCode}
        functionName={actionType === 'single' ? functionName : multiFunctionName}
        cnFunctionName={actionType === 'single' ? cnFunctionName : multiCnFunctionName}
      />
    </Fragment>
  )
}
