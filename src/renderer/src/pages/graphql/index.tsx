import GraphqlList from './components/graphql-list'
import GraphqlGen from './components/graphql-gen'
import { useGraphql } from '../../store/graphql'
import { useEffect } from 'react'

export interface GraphqlOptionsProps {
  label: string
  dataSource: { label: string; value: string }[]
}

const Graphql = () => {
  const { configId, setConfigId } = useGraphql()

  useEffect(() => {
    const id = sessionStorage.getItem('configId')
    if (id) {
      setConfigId(id)
    }
  }, [setConfigId])

  if (!configId) return <GraphqlList />
  return <GraphqlGen />
}

export default Graphql
