import { Button } from '@/components/ui/button'
import db from '@/lib/db'
import { useToast } from '@/components/ui/use-toast'
import dayjs from 'dayjs'

import { useCollectionList } from '@/store/graphql'
import { nanoid } from 'nanoid'

export function AddCollection({
  schemaCode,
  typesCode,
  functionName,
  cnFunctionName
}: {
  disabled?: boolean
  schemaCode?: string
  typesCode?: string
  functionName?: string
  cnFunctionName?: string
}) {
  const { collection } = useCollectionList()
  const { toast } = useToast()

  const handleAddCollection = () => {
    if (!functionName || !typesCode || !collection || !schemaCode || !cnFunctionName) {
      return
    }
    db.schema
      .add({
        id: nanoid(),
        name: functionName,
        cnName: cnFunctionName,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        groupId: collection.id,
        configId: collection.configId,
        schemaCode,
        typesCode
      })
      .then(() => {
        toast({
          title: '添加成功',
          description: `已添加到集合${collection.name}中`
        })
      })
      .catch((err) => {
        toast({
          title: '添加失败',
          description: err.message,
          variant: 'destructive'
        })
      })
  }

  return (
    <Button
      onClick={handleAddCollection}
      disabled={!functionName || !typesCode || !collection || !schemaCode || !cnFunctionName}
    >
      添加到集合
    </Button>
  )
}
