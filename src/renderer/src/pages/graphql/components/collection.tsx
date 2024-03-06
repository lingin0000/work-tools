import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import dayjs from 'dayjs'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import db, { Config } from '@/lib/db'
import { useCollectionList } from '@/store/graphql'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { nanoid } from 'nanoid'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FormValues {
  path: string
  collectionName: string
}

export function Collection({ configId }: { configId: string }) {
  const [open, setOpen] = React.useState(false)
  const [config, setConfig] = React.useState<Config | null>(null)
  const [folderOpen, setFolderOpen] = React.useState(false)
  const collectionIdRef = React.useRef<string | null>(null)

  const formSchema = z.object({
    path: z.string().min(1),
    collectionName: z.string().min(1)
  })
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  })
  const folderFormSchema = z.object({
    extraPath: z.string().min(1)
  })
  const folderForm = useForm<{ extraPath: string }>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: {
      extraPath: '/src/pages'
    }
  })

  const {
    collectionList,
    initCollectionList,
    setCollectionList,
    removeCollection,
    removeCollectionList,
    updateCollection
  } = useCollectionList()

  const onSubmit = (values: FormValues) => {
    if (!configId) {
      return
    }
    if (collectionIdRef.current) {
      updateCollection(collectionIdRef.current, {
        name: values.collectionName,
        path: values.path,
        configId
      })
    } else {
      setCollectionList([
        {
          name: values.collectionName,
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          path: values.path,
          id: nanoid(),
          configId
        }
      ])
    }
    setOpen(false)
  }

  const handleDelete = (id: string) => {
    removeCollection(id, configId)
  }

  const handleGen = (values: { extraPath: string }) => {
    if (!config?.registryPath) {
      return
    }
    window.electron.ipcRenderer.send('get-folder', {
      registryPath: config.registryPath,
      extraPath: values.extraPath
    })
  }

  useEffect(() => {
    initCollectionList(configId)
    ;(async () => {
      const data = await db.config.get(configId)
      if (data) {
        setConfig(data)
      }
    })()
  }, [configId])

  useEffect(() => {
    window.electron.ipcRenderer.on('get-folder-reply', (_, arg) => {
      if (arg.success) {
        const _data = arg.result.map((item: { name: string; path: string }) => ({
          name: item.name,
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          path: item.path,
          id: nanoid(),
          configId
        }))
        setCollectionList(_data)
      }
    })
    return () => {
      window.electron.ipcRenderer.removeAllListeners('get-folder-reply')
    }
  }, [])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">集合列表</Button>
      </DialogTrigger>
      <DialogContent className="p-6 sm:max-w-[1200px]">
        <div className="mx-auto w-full">
          <DialogHeader className="mb-2">
            <DialogTitle>
              集合列表
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    创建集合
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>创建一个schema的集合</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <FormField
                        control={form.control}
                        name="path"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>集合路径</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              集合的文件路径 例如
                              e:\mingri\monitoring\src\pages\IterationManagement\apis\schema
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="collectionName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>集合名字</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>集合的名字 例如 迭代管理</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">保存</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Dialog open={folderOpen} onOpenChange={setFolderOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    读取项目文件夹生成集合
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>输入基于项目文件夹的路径</DialogTitle>
                  </DialogHeader>
                  <Form {...folderForm}>
                    <form onSubmit={folderForm.handleSubmit(handleGen)} className="space-y-8">
                      <FormField
                        control={folderForm.control}
                        name="extraPath"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>文件夹路径</FormLabel>
                            <FormDescription>{config?.registryPath}下的文件路径</FormDescription>
                            <FormControl>
                              <Input {...field} prefix={config?.registryPath} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">保存</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="ml-2" onClick={removeCollectionList}>
                删除所有集合
              </Button>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">集合名称</TableHead>
                  <TableHead>集合路径</TableHead>
                  <TableHead className="w-[300px]">创建时间</TableHead>
                  <TableHead className="w-[300px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collectionList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.path}</TableCell>
                    <TableCell className="font-medium">{item.createdAt.valueOf()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          form.setValue('path', item.path)
                          form.setValue('collectionName', item.name)
                          collectionIdRef.current = item.id
                          setOpen(true)
                        }}
                      >
                        编辑
                      </Button>
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
              <div hidden={collectionList.length > 0} className="text-center p-6 w-full">
                请添加数据
              </div>
            </Table>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
