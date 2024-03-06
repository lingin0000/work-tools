// 实现一个可勾选的tree组件

import { useState, useEffect, Fragment, useImperativeHandle, forwardRef, Ref } from 'react'

import { cn } from '@/lib/utils'
import { Checkbox } from './checkbox'
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Input } from './input'

export interface TreeNode {
  title: string
  value: string
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
    }[]
  ) => void
}
export interface TreeRef {
  checkAll: () => void
}

function Tree({ data, onChange }: TreeProps, ref: Ref<TreeRef>) {
  const [treeData, setTreeData] = useState<TreeNode[]>(data)
  const getCheckedData = (data: TreeNode[]) => {
    let result: {
      value: string
      alias?: string
    }[] = []
    data.forEach((node) => {
      if (node.checked) {
        result.push({
          value: node.value,
          alias: node.alias
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
      if (n.value === _node.value) {
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
      if (n.value === node.value) {
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
  }, [data.map((node) => node.value).join('-')])

  return (
    <Fragment>
      {treeData.map((node, index) => (
        <TreeNode
          key={index}
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
            <label htmlFor={node.value} className="">
              {node.title}
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="secondary" className="ml-2 h-6">
                    {node.alias || '设置别名'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <h4 className="font-medium leading-none">{node.value}的别名</h4>
                    <Input
                      defaultValue={node.alias}
                      className="col-span-2 h-8"
                      onBlur={(e) => {
                        handleSetAlias(e.target.value)
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
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
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
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
