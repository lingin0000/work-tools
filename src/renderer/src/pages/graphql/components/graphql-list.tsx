import { Button } from '@/components/ui/button'
import { Fragment, useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Card, CardDescription, CardContent, CardTitle, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

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
import db, { Config } from '@/lib/db'
import { useToast } from '@/components/ui/use-toast'
import { Edit3Icon, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'
import { Inputs } from '@/components/ui/inputs'
import { nanoid } from 'nanoid'
import { useGraphql } from '@/store/graphql'

export interface FormValues {
  name: string
  description: string
  urls: string[]
  registryPath: string
  gql: string
  id?: string
}

// 配置的列表项
const GraphqlList = () => {
  const { toast } = useToast()
  const { setConfigId } = useGraphql()
  const [configList, setConfigList] = useState<Config[]>([])
  const [open, setOpen] = useState(false)

  const formSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    urls: z.array(z.string().min(1)).min(1),
    registryPath: z.string().min(1),
    gql: z.string().min(1),
    id: z.string().optional()
  })
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  })

  const onSubmit = async (values: FormValues) => {
    if (!values.id) {
      const config = {
        ...values,
        id: nanoid(),
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      const result = await db.config.add(config)
      if (result) {
        db.config.toArray().then((data) => {
          setConfigList(data)
          toast({
            title: '保存成功',
            description: '保存成功'
          })
          setOpen(false)
        })
      }
    } else {
      const config = {
        ...values,
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      const result = await db.config.update(values.id, config)
      if (result) {
        db.config.toArray().then((data) => {
          setConfigList(data)
          toast({
            title: '保存成功',
            description: '保存成功'
          })
          setOpen(false)
        })
      }
    }
  }

  const handleDelete = (id: string) => {
    db.config
      .where('id')
      .equals(id)
      .delete()
      .then(() => {
        db.config.toArray().then((data) => {
          setConfigList(data)
          toast({
            title: '删除成功',
            description: '删除成功'
          })
        })
      })
  }

  useEffect(() => {
    db.config.toArray().then((data) => {
      setConfigList(data)
    })
  }, [])

  return (
    <Fragment>
      <div className="flex gap-4 flex-wrap">
        {configList?.map((item) => {
          return (
            <Card
              key={item.id}
              onClick={() => {
                sessionStorage.setItem('configId', item.id)
                setConfigId(item.id)
              }}
              className="w-[550px]  cursor-pointer relative hover:shadow-lg  transition-all duration-300 ease-in-out"
            >
              <div className="absolute top-2 right-3 flex gap-3 flex-row">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleDelete(String(item.id))
                  }}
                  size="icon"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    form.setValue('name', item.name)
                    form.setValue('description', item.description)
                    form.setValue('urls', item.urls)
                    form.setValue('registryPath', item.registryPath)
                    form.setValue('gql', item.gql)
                    form.setValue('id', item.id)
                    setOpen(true)
                  }}
                  size="icon"
                >
                  <Edit3Icon className="w-5 h-5" />
                </Button>
              </div>

              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2 flex-col">
                <div className="flex gap-4">
                  <span>schema地址:</span>
                  <span>{item.urls?.join(',')}</span>
                </div>
                <div className="flex gap-4">
                  <span>仓库地址:</span>
                  <span>{item.registryPath}</span>
                </div>
                <div className="flex gap-4">
                  <span>导入gql方法的仓库:</span>
                  <span>{item.gql}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
        <Card className="w-[550px] cursor-pointer relative hover:shadow-lg transition-all duration-300 ease-in-out">
          <CardHeader>
            <CardTitle>新增项目</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              <Dialog
                open={open}
                onOpenChange={(open) => {
                  form.reset()
                  setOpen(open)
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">新增项目</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[725px]">
                  <DialogHeader>
                    <DialogTitle>配置项目</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <div className="flex flex-wrap gap-4 w-full">
                        <FormField
                          control={form.control}
                          name="id"
                          render={({ field }) => (
                            <FormItem hidden>
                              <FormControl>
                                <Input {...field} className="w-80" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />{' '}
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>项目名称</FormLabel>
                              <FormDescription>项目名称</FormDescription>
                              <FormControl>
                                <Input {...field} className="w-80" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="registryPath"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>仓库地址</FormLabel>
                              <FormDescription>在当前电脑的路径</FormDescription>
                              <FormControl>
                                <Input {...field} className="w-80" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gql"
                          defaultValue="@apollo/client"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GQL</FormLabel>
                              <FormDescription>导入gql方法的仓库</FormDescription>
                              <FormControl>
                                <Input {...field} className="w-80" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>项目描述</FormLabel>
                              <FormDescription>项目描述</FormDescription>
                              <FormControl>
                                <Input {...field} className="w-80" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="urls"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>schema地址</FormLabel>
                              <FormDescription>
                                获取schema数据地址,输入后按Enter键添加
                              </FormDescription>
                              <FormControl>
                                <Inputs {...field} className="w-80" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className=" w-full text-right">
                        <Button type="submit">保存</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </Fragment>
  )
}

export default GraphqlList
