import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { GraphQLArgument } from 'graphql'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { forwardRef } from 'react'

interface CheckInputProps {
  value: {
    checked: boolean
    value: string
    rename: string
  }
  onChange: (value: CheckInputProps['value']) => void
  arg: GraphQLArgument
}

const CheckInput = forwardRef<HTMLInputElement, CheckInputProps>((props) => {
  const {
    value = {
      checked: false,
      value: '',
      rename: ''
    },
    onChange,
    arg
  } = props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const name = (arg.type as any).name || (arg.type as any).ofType?.name

  return (
    <React.Fragment>
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={value.checked}
          onCheckedChange={(_v) => {
            onChange({
              checked: _v as boolean,
              value: value.value,
              rename: value.rename
            })
          }}
        />
        <FormLabel>{arg.name}</FormLabel>
      </div>
      <FormDescription className="pb-2 pt-2" hidden={!arg.description}>
        {arg.description}
      </FormDescription>
      <FormDescription className="font-bold pb-2">
        {name}
        <QuestionMarkCircledIcon className="w-4 h-4 ml-2 inline-block" />
      </FormDescription>
      <div className="flex items-center space-x-2">
        <FormLabel className="w-18">默认值</FormLabel>
        <Textarea
          value={value.value}
          className="flex-1"
          onChange={(e) => {
            onChange({
              checked: value.checked,
              value: e.target.value,
              rename: value.rename
            })
          }}
        />
      </div>
      <div className="flex items-center space-x-2">
        <FormLabel className="w-18">重命名</FormLabel>
        <Input
          value={value.rename}
          className="flex-1"
          onChange={(e) => {
            onChange({
              checked: value.checked,
              value: value.value,
              rename: e.target.value
            })
          }}
        />
      </div>
    </React.Fragment>
  )
})

CheckInput.displayName = 'CheckInput'

export function Args({
  dataSource = [],
  form
}: {
  dataSource?: ReadonlyArray<GraphQLArgument>
  type?: 'query' | 'mutation' | 'subscription'
  form: ReturnType<typeof useForm>
}) {
  React.useEffect(() => {
    form.reset()
  }, [JSON.stringify(dataSource)])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>入参参数</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-96 p-4">
          <Form {...form}>
            <form className="space-y-6">
              {dataSource.map((arg) => {
                return (
                  <FormField
                    defaultValue={{
                      checked: true,
                      value: ''
                    }}
                    key={arg.name}
                    control={form.control}
                    name={arg.name}
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-3 rounded-md border p-4 shadow">
                        <FormControl>
                          <CheckInput {...field} arg={arg} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )
              })}
            </form>
          </Form>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
