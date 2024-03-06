import fetchGraphql, { DataSource } from '@/lib/fetch-graphql'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { GraphQLFieldMap } from 'graphql'
import { getMutationType, getQueryType, getSubscriptionType } from '@/lib/graphql-action'
import { GenCode } from './gen-code'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReloadIcon } from '@radix-ui/react-icons'
import { useToast } from '@/components/ui/use-toast'
import db, { Config } from '@/lib/db'
import { cn } from '@/lib/utils'
import { Collection } from './collection'
import { SchemaList } from './schema'
import { SelectCollection } from './select-collection'
import { useDataSource, useGraphql } from '@/store/graphql'
import { SelectConfig } from './select-config'
import { Separator } from '@/components/ui/separator'

export interface GraphqlOptionsProps {
  label: string
  dataSource: { label: string; value: string }[]
}

const Graphql = () => {
  const { toast } = useToast()
  const { configId } = useGraphql()
  const [config, setConfig] = useState<Config>()

  const [options, setOptions] = useState<{
    query: GraphqlOptionsProps[]
    mutation: GraphqlOptionsProps[]
    subscription: GraphqlOptionsProps[]
  }>({
    query: [],
    mutation: [],
    subscription: []
  })

  const [loading, setLoading] = useState(false)
  const { setDataSource } = useDataSource()
  const [activeKey, setActiveKey] = useState('query')
  const [graphQLFields, setGraphQLFields] = useState<{
    query?: GraphQLFieldMap<any, any>
    mutation?: GraphQLFieldMap<any, any>
    subscription?: GraphQLFieldMap<any, any>
  }>({
    query: {},
    mutation: {},
    subscription: {}
  })

  const getOptions = (fields: GraphQLFieldMap<any, any> | undefined) => {
    return Object.values(fields || {}).map((field) => ({
      label: field.description || '',
      value: field.name
    }))
  }

  const formatSchema = (schema: Record<string, DataSource>) => {
    const schemaList = Object.entries(schema)
    let queryFields: GraphQLFieldMap<any, any> = {}
    let mutationFields: GraphQLFieldMap<any, any> = {}
    let subscriptionFields: GraphQLFieldMap<any, any> = {}

    const queryOptions: GraphqlOptionsProps[] = []
    const mutationOptions: GraphqlOptionsProps[] = []
    const subscriptionOptions: GraphqlOptionsProps[] = []
    schemaList.forEach(([key, value]) => {
      const queryField = getQueryType(value.schema)
      const mutationField = getMutationType(value.schema)
      const subscriptionField = getSubscriptionType(value.schema)
      queryFields = { ...queryFields, ...queryField }
      mutationFields = { ...mutationFields, ...mutationField }
      subscriptionFields = { ...subscriptionFields, ...subscriptionField }

      const queryOption = getOptions(queryField)
      queryOptions.push({
        label: key,
        dataSource: queryOption
      } as GraphqlOptionsProps)

      const mutationOption = getOptions(mutationField)
      mutationOptions.push({
        label: key,
        dataSource: mutationOption
      } as GraphqlOptionsProps)

      const subscriptionOption = getOptions(subscriptionField)
      subscriptionOptions.push({
        label: key,
        dataSource: subscriptionOption
      } as GraphqlOptionsProps)
    })
    setGraphQLFields({
      query: queryFields,
      mutation: mutationFields,
      subscription: subscriptionFields
    })
    setOptions({
      query: queryOptions,
      mutation: mutationOptions,
      subscription: subscriptionOptions
    })
  }

  const handleFetch = async (_config?: Config) => {
    const __config = _config || config
    if (!__config?.urls?.length) {
      toast({
        title: '请求失败',
        description: '请先配置数据源',
        variant: 'destructive'
      })
      return
    }
    setLoading(true)
    try {
      const _schema = await new fetchGraphql().genSource(__config.urls)
      if (_schema.error || !_schema.mergeSchema) {
        throw new Error('获取数据失败')
      }
      setDataSource({
        mergeSchema: _schema.mergeSchema,
        schemaMap: _schema.schemaMap
      })
      formatSchema(_schema.schemaMap)
      toast({
        title: '请求完成',
        description: '数据获取成功',
        className: cn('top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4')
      })
    } catch (e) {
      console.error(e)
      toast({
        title: '请求失败',
        description: '数据获取失败',
        variant: 'destructive',
        className: cn('top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4')
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (configId) {
      db.config.get(configId).then((data) => {
        if (data) {
          setConfig(data)
          handleFetch(data)
        }
      })
    }
  }, [configId])

  return (
    <div className="mt-1">
      <div className="flex gap-2 pl-1">
        <SelectConfig setConfig={setConfig} />
        <SelectCollection />
        <Collection configId={configId || ''} />
        <SchemaList configId={configId || ''} />
      </div>
      <Separator className="my-2" />
      <Tabs value={activeKey} className="w-full">
        <TabsList>
          <TabsTrigger
            value="query"
            onClick={() => {
              setActiveKey('query')
            }}
          >
            查询(Query)
          </TabsTrigger>
          <TabsTrigger
            value="mutation"
            onClick={() => {
              setActiveKey('mutation')
            }}
          >
            变更(Mutation)
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            onClick={() => {
              setActiveKey('subscription')
            }}
          >
            订阅(Subscription)
          </TabsTrigger>
        </TabsList>
        <Button
          className="ml-2"
          variant="secondary"
          type="submit"
          disabled={loading}
          onClick={() => {
            handleFetch()
          }}
        >
          {loading && <ReloadIcon className="mr-2 h-2 w-2 animate-spin" />}
          {options?.query?.length ? '重新获取' : '获取数据'}
        </Button>

        <TabsContent value="query" forceMount hidden={activeKey !== 'query'}>
          <GenCode
            options={options.query}
            graphQLFields={graphQLFields.query}
            type="query"
            config={config}
          />
        </TabsContent>
        <TabsContent value="mutation" forceMount hidden={activeKey !== 'mutation'}>
          <GenCode
            options={options.mutation}
            graphQLFields={graphQLFields.mutation}
            type="mutation"
            config={config}
          />
        </TabsContent>
        <TabsContent value="subscription" forceMount hidden={activeKey !== 'subscription'}>
          <GenCode
            options={options.subscription}
            graphQLFields={graphQLFields.subscription}
            type="subscription"
            config={config}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Graphql
