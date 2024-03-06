import { create } from 'zustand'
import db, { Group } from '@/lib/db'
import { DataSource } from '@/lib/fetch-graphql'
import { GraphQLSchema } from 'graphql/type/schema'

function sortCollectionList(collectionList: Group[]) {
  return collectionList.sort((a, b) => {
    if (a.name > b.name) return 1
    return -1
  })
}

const useCollectionList = create<{
  collection?: Group
  collectionList: Group[]
  setCollection: (collection?: Group) => void
  setCollectionList: (collectionList: Group[]) => void
  removeCollectionList: () => void
  initCollectionList: (configId: string) => void
  removeCollection: (id: string, configId: string) => void
  updateCollection: (id: string, data: Partial<Group>) => void
}>((set) => ({
  collection: {} as Group,
  collectionList: [] as Group[],
  setCollection: (collection?: Group) => {
    set({ collection })
  },
  setCollectionList: (collectionList: Group[]) => {
    db.group.bulkPut(collectionList).then(() => {
      db.group
        .filter((item) => item.configId === collectionList[0].configId)
        .toArray()
        .then((res) => {
          set({ collectionList: sortCollectionList(res) })
        })
    })
  },
  removeCollectionList: () => {
    db.group.clear().then(() => {
      set({ collectionList: [] })
    })
  },
  removeCollection: (id: string, configId: string) => {
    db.group.delete(id).then(() => {
      db.group
        .filter((item) => String(item.configId) === String(configId))
        .toArray()
        .then((res) => {
          set({ collectionList: sortCollectionList(res) })
        })
    })
  },

  updateCollection: (id: string, data: Partial<Group>) => {
    db.group.update(id, data).then(() => {
      db.group
        .filter((item) => item.configId === data.configId)
        .toArray()
        .then((res) => {
          set({ collectionList: sortCollectionList(res) })
        })
    })
  },

  initCollectionList: (configId: string) => {
    db.group
      .filter((item) => item.configId === configId)
      .toArray()
      .then((res) => {
        set({ collectionList: sortCollectionList(res), collection: res[0] })
      })
  }
}))

const useDataSource = create<{
  schemaMap?: Record<string, DataSource>
  mergeSchema: GraphQLSchema
  setDataSource: (dataSource: {
    mergeSchema: GraphQLSchema
    schemaMap: Record<string, DataSource>
  }) => void
}>((set) => ({
  schemaMap: {},
  mergeSchema: {} as GraphQLSchema,
  setDataSource: (dataSource) => {
    set({
      schemaMap: dataSource.schemaMap,
      mergeSchema: dataSource.mergeSchema
    })
  }
}))

const useGraphql = create<{
  configId?: string
  setConfigId: (configId: string) => void
}>((set) => ({
  configId: undefined,
  setConfigId: (configId: string) => {
    set({ configId })
  }
}))

export { useCollectionList, useDataSource, useGraphql }
