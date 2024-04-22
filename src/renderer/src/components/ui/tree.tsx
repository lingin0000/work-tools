import { useState, useEffect, Fragment, useImperativeHandle, forwardRef, Ref, useRef } from 'react'

import { cn } from '@/lib/utils'
import { Checkbox } from './checkbox'
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { Button } from './button'
import { Input } from './input'

export interface TreeNode {
  title: string
  value: string
  key: string
  children?: TreeNode[]
  alias?: string
  description?: string
  checked?: boolean
}

interface TreeProps {
  data: TreeNode[]
  onChange: (
    data: {
      value: string
      alias?: string
      key: string
    }[]
  ) => void
}
export interface TreeRef {
  checkAll: () => void
}

function Tree({ data, onChange }: TreeProps, ref: Ref<TreeRef>) {
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const flatData = useRef<TreeNode[]>([])
  const getCheckedData = (data: TreeNode[]) => {
    let result: {
      value: string
      alias?: string
      key: string
    }[] = []
    data.forEach((node) => {
      if (node.checked) {
        result.push({
          value: node.value,
          alias: node.alias,
          key: node.key
        })
      }
      if (node.children) {
        result = result.concat(getCheckedData(node.children))
      }
    })
    return result
  }

  const handleCheck = (node: TreeNode, checked: boolean) => {
    node.checked = checked
    if (node.children) {
      node.children.forEach((child) => {
        handleCheck(child, checked)
      })
    }
    return node
  }

  const handleNodeCheck = (node: TreeNode, checked: boolean) => {
    const _node = handleCheck(node, checked)
    // find the node in the treeData and update it
    const _treeData = treeData.map((n) => {
      if (n.key === _node.key) {
        return _node
      }
      return n
    })
    setTreeData(_treeData)
    onChange(getCheckedData(_treeData))
  }

  const handleCheckAll = () => {
    const _treeData = treeData.map((node) => {
      const _node = handleCheck(node, true)
      return _node
    })
    setTreeData(_treeData)
    onChange(getCheckedData(_treeData))
  }

  const handleAlias = (node: TreeNode) => {
    const _treeData = treeData.map((n) => {
      if (n.key === node.key) {
        return {
          ...n,
          alias: node.alias
        }
      }
      return n
    })
    setTreeData(_treeData)
    onChange(getCheckedData(_treeData))
  }

  useImperativeHandle(ref, () => ({
    checkAll: handleCheckAll
  }))

  useEffect(() => {
    setTreeData(data)
    flatData.current = []
    const flat = (data: TreeNode[]) => {
      data.forEach((node) => {
        flatData.current.push(node)
        if (node.children) {
          flat(node.children)
        }
      })
    }
    flat(data)
  }, [data.map((node) => node.key).join('-')])

  return (
    <Fragment>
      {treeData.map((node) => (
        <TreeNode
          key={node.key}
          node={node}
          onCheck={handleNodeCheck}
          level={0}
          onAlias={handleAlias}
        />
      ))}
    </Fragment>
  )
}

export default forwardRef(Tree)

interface TreeNodeProps {
  node: TreeNode
  level: number
  onCheck: (node: TreeNode, checked: boolean) => void
  onAlias: (node: TreeNode) => void
}

function Title({
  alias,
  handleSetAlias
}: {
  alias?: string
  handleSetAlias: (alias: string) => void
}) {
  const [edit, setEdit] = useState(false)
  return (
    <div
      className="inline-block ml-2"
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      {edit ? (
        <Input
          defaultValue={alias}
          onBlur={(e) => {
            setEdit(false)
            handleSetAlias(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setEdit(false)
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              handleSetAlias(e.target.value)
            }
          }}
          autoFocus
          className="col-span-2 h-6"
        />
      ) : (
        <Button
          variant="secondary"
          className="col-span-2 h-6"
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setEdit(true)
          }}
        >
          {alias || '别名'}
        </Button>
      )}
    </div>
  )
}

function TreeNode({ node, level, onCheck, onAlias }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(false)

  const handleCheck = (checked: boolean) => {
    onCheck(node, checked)
  }

  const handleSetAlias = (alias: string) => {
    node.alias = alias
    onAlias(node)
  }

  return (
    <Fragment>
      <div className={cn('flex items-center gap-2 p-1', 'hover:bg-gray-100', 'transition-colors')}>
        {node.children && (
          <Button
            className="h-5 w-5"
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </Button>
        )}
        <div className="items-center flex space-x-2 flex-1">
          <Checkbox id={node.value} checked={node.checked} onCheckedChange={handleCheck} />
          <div className="flex justify-between leading-none flex-1">
            <label htmlFor={node.value}>
              {node.title}
              <Title handleSetAlias={handleSetAlias} alias={node.alias} />
            </label>
            <div className="text-sm text-muted-foreground">{node.description}</div>
          </div>
        </div>
      </div>
      {node.children && expanded && (
        <div
          style={{
            paddingLeft: 68
          }}
          data-level={level + 1}
        >
          {node.children.map((child) => (
            <TreeNode
              key={child.key}
              node={child}
              level={level + 1}
              onCheck={onCheck}
              onAlias={onAlias}
            />
          ))}
        </div>
      )}
    </Fragment>
  )
}
