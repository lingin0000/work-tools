import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { AddCollection } from './add-collection'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'

export function CodePreview({
  schemaCode,
  typesCode,
  functionName,
  cnFunctionName
}: {
  schemaCode: string
  typesCode: string
  functionName: string
  cnFunctionName: string
}) {
  const { toast } = useToast()
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: '复制成功', description: '代码已复制到剪贴板' })
  }
  return (
    <div className="flex gap-4 mb-4 mt-4">
      <div className=" fixed bottom-9 right-4"></div>
      <Card className="w-full  min-h-72">
        <CardHeader>
          <CardTitle>
            <AddCollection
              schemaCode={schemaCode}
              typesCode={typesCode}
              functionName={functionName}
              cnFunctionName={cnFunctionName}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel className="relative min-h-48">
              <Button
                className="absolute top-2 right-2"
                disabled={!schemaCode}
                onClick={() => {
                  handleCopyCode(schemaCode)
                }}
              >
                复制代码
              </Button>
              <code>
                <pre>{schemaCode}</pre>
              </code>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel className="p-4 relative  min-h-48">
              <Button
                className="absolute top-2 right-2"
                disabled={!typesCode}
                onClick={() => {
                  handleCopyCode(typesCode)
                }}
              >
                复制代码
              </Button>
              <code>
                <pre>{typesCode}</pre>
              </code>
            </ResizablePanel>
          </ResizablePanelGroup>
        </CardContent>
      </Card>
    </div>
  )
}
