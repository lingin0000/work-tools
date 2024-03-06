import { useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { ScrollArea } from '@/components/ui/scroll-area'
import Tree, { TreeNode, TreeRef } from '@/components/ui/tree'
import { Button } from '@/components/ui/button'

export function Fields({
  dataSource = [],
  onChange
}: {
  dataSource?: TreeNode[]
  onChange: (
    data: {
      value: string
      alias?: string
    }[]
  ) => void
}) {
  const treeRef = useRef<TreeRef>(null)

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
          <Tree ref={treeRef} data={dataSource} onChange={onChange} />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
