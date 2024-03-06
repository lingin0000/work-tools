import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import db, { type Schema } from '@/lib/db'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCollectionList } from '@/store/graphql'
import { useToast } from '@/components/ui/use-toast'

export function SchemaList({ configId }: { configId: string }) {
  const { toast } = useToast()
  const [codeList, setCodeList] = React.useState<Schema[]>([])
  const [groupId, setGroupId] = React.useState<string>()
  const { collectionList, collection } = useCollectionList()

  const handleFetchSchema = (groupId: string) => {
    setGroupId(groupId)
    db.schema
      .filter((item) => item.configId === configId && item.groupId === groupId)
      .toArray()
      .then((res) => {
        setCodeList(res)
      })
  }

  const handleDelete = (id: string) => {
    db.schema
      .delete(id)
      .then(() => {
        if (groupId) {
          handleFetchSchema(groupId)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const handleGen = () => {
    const _path = collectionList.find((item) => item.id === groupId)?.path
    if (!_path) return
    fetch('/api/schema', {
      method: 'POST',
      body: JSON.stringify({
        codeList,
        prefix: `${_path}`,
        schemaCodePath: '/apis/schema/',
        typesCodePath: '/apis/type/'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        return res.json()
      })
      .then((res) => {
        if (res.success) {
          toast({ title: '生成成功', description: '文件已生成' })
        }
      })
  }

  useEffect(() => {
    if (!groupId && collection?.id) {
      handleFetchSchema(collection.id)
    }
  }, [collection?.id, groupId])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">方法列表</Button>
      </DialogTrigger>
      <DialogContent className="p-6 sm:max-w-[1025px]">
        <div className="mx-auto w-full">
          <div className="mb-4 flex gap-3">
            <Select
              value={String(groupId || collection?.id)}
              onValueChange={(value) => handleFetchSchema(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择一个集合" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>集合</SelectLabel>
                  {collectionList.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button onClick={handleGen}>生成文件</Button>
          </div>
          <ScrollArea className=" h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">方法名称</TableHead>
                  <TableHead className="w-[200px]">创建时间</TableHead>
                  <TableHead className="w-[100px]">schemaCode</TableHead>
                  <TableHead className="w-[100px]">typesCode</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codeList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="font-medium">{item.createdAt.valueOf()}</TableCell>
                    <TableCell className="font-medium">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            查看schema
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{item.name}的schemaCode</DialogTitle>
                          </DialogHeader>
                          <div className="h-96 w-screen overflow-y-scroll">
                            <pre>
                              <code>{item.schemaCode}</code>
                            </pre>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            查看types
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{item.name}的typesCode</DialogTitle>
                          </DialogHeader>
                          <div className="h-96 w-screen overflow-y-scroll">
                            <pre>
                              <code>{item.typesCode}</code>
                            </pre>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger>
                          <Button className="ml-2" variant="destructive" size="sm">
                            删除
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div>确定删除吗？</div>
                          <Button
                            variant="destructive"
                            className="mt-2"
                            onClick={() => handleDelete(item.id)}
                            size="sm"
                          >
                            确认
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <div hidden={codeList.length > 0} className="text-center p-6 w-full">
                请添加数据
              </div>
            </Table>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
