// Json 处理工具集
'use client'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useEffect, useState } from 'react'
import { MonacoEditor } from '@/components/ui/monaco-editor'
import sample from './sample.json'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import GridView from './grid-view'

export default function FormatJson() {
  const [value, setValue] = useState<string | undefined>()
  const [formatValue, setFormatValue] = useState('')
  const [language, setLanguage] = useState<'json' | 'yaml' | 'xml' | 'grid'>('json')
  const { toast } = useToast()
  const handleFormat = () => {
    if (!value) return setFormatValue('')
    try {
      const result = JSON.stringify(JSON.parse(value), null, 2)
      setLanguage('json')
      setFormatValue(result)
    } catch (e) {
      setFormatValue((e as Error).message)
    }
  }

  const handleMinify = () => {
    if (!value) return setFormatValue('')
    try {
      const result = JSON.stringify(JSON.parse(value))
      setLanguage('json')
      setFormatValue(result)
    } catch (e) {
      setFormatValue((e as Error).message)
    }
  }

  const handleToYaml = () => {
    if (!value) return setFormatValue('')
    try {
      const jsonDocument = JSON.parse(value)
      window.electron.ipcRenderer.send('json2yaml', {
        jsonDocument
      })
    } catch (e) {
      setFormatValue((e as Error).message)
    }
  }

  const handleToXml = () => {
    if (!value) return setFormatValue('')
    try {
      const jsonDocument = JSON.parse(value)
      window.electron.ipcRenderer.send('json2xml', {
        jsonDocument
      })
    } catch (e) {
      setFormatValue((e as Error).message)
    }
  }

  const handleGrid = () => {
    if (!value) return setFormatValue('')
    setLanguage('grid')
  }

  const handleCopy = () => {
    if (!formatValue) return
    navigator.clipboard.writeText(formatValue)
    toast({
      title: '复制成功',
      description: '已复制到剪贴板'
    })
  }

  useEffect(() => {
    window.electron.ipcRenderer.on('json2xml-reply', (_, arg) => {
      if (arg.success) {
        setLanguage('xml')
        setFormatValue(arg.result)
      } else {
        setFormatValue(arg.message)
      }
    })

    window.electron.ipcRenderer.on('json2yaml-reply', (_, arg) => {
      if (arg.success) {
        setLanguage('yaml')
        setFormatValue(arg.result)
      } else {
        setFormatValue(arg.message)
      }
    })
    return () => {
      window.electron.ipcRenderer.removeAllListeners('json2xml-reply')
      window.electron.ipcRenderer.removeAllListeners('json2yaml-reply')
    }
  }, [])

  return (
    <>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <div className="flex w-full gap-2 items-center">
            <Button onClick={() => setValue('')} variant="secondary">
              清空
            </Button>
            <Button onClick={() => setValue(JSON.stringify(sample, null, 2))} variant="secondary">
              示例
            </Button>
            <Button onClick={handleFormat} variant="secondary">
              格式化
            </Button>
            <Button onClick={handleMinify} variant="secondary">
              压缩
            </Button>
            <Button onClick={handleToYaml} variant="secondary">
              转yaml
            </Button>
            <Button onClick={handleToXml} variant="secondary">
              转xml
            </Button>
            <Button onClick={handleGrid} variant="secondary">
              可视化
            </Button>
          </div>
          <MonacoEditor
            value={value}
            onChange={(value) => {
              setValue(value)
            }}
            className="mt-2"
            language="json"
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="pl-4 pr-4">
          <div className="flex w-full gap-2 items-center">
            <Button onClick={handleCopy} variant="secondary">
              复制
            </Button>
          </div>
          <div hidden={language !== 'grid'}>
            <GridView value={value ? JSON.parse(value) : ''} />
          </div>
          <div hidden={language === 'grid'}>
            <MonacoEditor className="mt-2" value={formatValue} language={language} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  )
}
