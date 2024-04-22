import { useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { ScrollArea } from '@/components/ui/scroll-area'
import Tree, { TreeRef } from '@/components/ui/tree'
import { Button } from '@/components/ui/button'
import { TreeDataItem } from '@/lib/graphql-convert'

export function Fields({
  dataSource = [],
  onChange
}: {
  dataSource?: TreeDataItem[]
  onChange: (
    data: {
      value: string
      alias?: string
      key: string
    }[]
  ) => void
}) {
  const treeRef = useRef<TreeRef>(null)
  // 给数据添加key
  const getData = (data: TreeDataItem[], parentKey?: string) => {
    return data.map((node) => {
      const key = parentKey ? `${parentKey}-${node.value}` : node.value
      return {
        ...node,
        key,
        children: node.children ? getData(node.children, key) : undefined
      }
    })
  }
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>出参参数</CardTitle>
        <CardDescription>
          选择出参参数
          <Button
            onClick={() => {
              treeRef.current?.checkAll()
            }}
            size="sm"
            variant="secondary"
            className="ml-2"
          >
            全选
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <ScrollArea className="h-96 p-4 pt-0">
          <Tree ref={treeRef} data={getData(dataSource)} onChange={onChange} />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
