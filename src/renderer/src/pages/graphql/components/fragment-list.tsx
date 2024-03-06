import { Button } from '@/components/ui/button'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
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
import { useState } from 'react'
import { type TreeItem } from '@/lib/graphql-convert'
import { type Arg } from './gen-code'
import { queryListTemplate } from '@/lib/templates/queryListTemplate'

export interface FragmentListProps {
  dataSource: {
    functionName: string
    fragment: string
    id: string
    args: Arg[]
    fields: TreeItem[]
  }[]
  onDelete: (id: string) => void
  onGenCode: (documents: string[], code: string, functionName: string) => void
}

interface FormValues {
  name: string
  [key: string]: string
}

export default function FragmentList({ dataSource = [], onDelete, onGenCode }: FragmentListProps) {
  const [open, setOpen] = useState(false)
  const formSchema = z.object({
    name: z.string().min(1),
    ...dataSource.reduce(
      (acc, item) => {
        acc[item.functionName] = z.string().min(0)
        return acc
      },
      {} as Record<string, z.ZodString>
    )
  })
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  })

  const onSubmit = async (values: FormValues) => {
    const fragments = dataSource.map((item) => {
      const args = item.args.map((arg) => {
        return {
          name: arg.name,
          value: values[arg.name],
          type: arg.type
        }
      })
      return {
        args,
        fields: item.fields,
        name: values[item.functionName]
          ? `${values[item.functionName]}: ${item.functionName}`
          : `${item.functionName}`
      }
    })
    const { code, query } = queryListTemplate(values.name, fragments)
    onGenCode([query], code, values.name)
    setOpen(false)
  }
  return (
    <Card className="w-full" hidden={dataSource.length === 0}>
      <CardHeader>
        <CardTitle>
          fragment列表{' '}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="ml-2">生成代码</Button>
            </DialogTrigger>
            <DialogContent className="p-6 sm:max-w-[825px]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>方法名称</FormLabel>
                        <FormDescription>这个请求的方法名称</FormDescription>
                        <FormControl>
                          <Input {...field} className="w-80" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-wrap gap-4 w-full">
                    {dataSource.map((item) => {
                      return (
                        <FormField
                          defaultValue=""
                          key={item.functionName}
                          control={form.control}
                          name={item.functionName}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{item.functionName}</FormLabel>
                              <FormDescription>重命名这个字段</FormDescription>
                              <FormControl>
                                <Input {...field} className="w-80" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )
                    })}
                  </div>
                  <div className=" w-full text-right">
                    <Button type="submit">确定</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {dataSource.map((item) => (
            <AccordionItem value={item.functionName} key={item.id}>
              <AccordionTrigger>
                <div>
                  {item.functionName}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete?.(item.id)
                    }}
                    className="ml-2"
                  >
                    删除
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <code>
                  <pre>{item.fragment}</pre>
                </code>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
