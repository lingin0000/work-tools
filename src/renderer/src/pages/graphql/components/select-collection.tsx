import { useCollectionList } from '@/store/graphql'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useGraphql } from '@/store/graphql'
import { useEffect } from 'react'

export function SelectCollection() {
  const { collectionList, setCollection, collection } = useCollectionList()
  const { configId } = useGraphql()
  const handleSelectedCollection = (value: string) => {
    const _collection = collectionList.find((item) => item.id === value)
    if (!_collection) {
      return
    }
    setCollection(_collection)
  }

  useEffect(() => {
    if (configId) {
      setCollection(undefined)
    }
  }, [configId])

  return (
    <Select onValueChange={(value) => handleSelectedCollection(value)} value={collection?.id}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="选择一个集合" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>选择集合</SelectLabel>
          {collectionList.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
