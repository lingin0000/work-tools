import { useGraphql } from '@/store/graphql'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useEffect, useState } from 'react'
import db, { Config } from '@/lib/db'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export function SelectConfig({ setConfig }: { setConfig: (config?: Config) => void }) {
  const { configId, setConfigId } = useGraphql()
  const [configList, setConfigList] = useState<Config[]>([])
  useEffect(() => {
    db.config.toArray().then((data) => {
      setConfigList(data)
    })
  }, [])

  return (
    <Select
      value={configId}
      onValueChange={(value) => {
        sessionStorage.setItem('configId', value)
        setConfigId(value)
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="选择一个项目" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>选择项目</SelectLabel>
          {configList.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectGroup>
        <Separator className="my-2" />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setConfigId('')
            sessionStorage.removeItem('configId')
            setConfig(undefined)
          }}
        >
          新建配置
        </Button>
      </SelectContent>
    </Select>
  )
}
