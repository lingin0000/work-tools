'use client'

import React, { Fragment, useState } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import { Delete } from 'lucide-react'

export interface InputsProps {
  value?: string[]
  onChange?: (value: string[]) => void
  className?: string
  type?: string
}

const Inputs = React.forwardRef<HTMLInputElement, InputsProps>(({ className, type, ...props }) => {
  const { value, onChange } = props
  const [editValue, setEditValue] = useState<string>('')
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const newValue = event.currentTarget.value
      if (onChange) {
        onChange([...(value || []), newValue])
      }
    }
  }
  return (
    <Fragment>
      {value?.map((item, index) => {
        return (
          <Badge
            key={index}
            className={cn('mr-1', 'mb-1')}
            onClick={() => {
              setEditValue(item)
            }}
          >
            {item}
            <Delete
              className="ml-1 cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (onChange) {
                  onChange(value?.filter((_, i) => i !== index))
                }
              }}
            />
          </Badge>
        )
      })}
      <Input
        className={className}
        type={type}
        onKeyDown={handleKeyDown}
        value={editValue}
        onChange={(e) => {
          setEditValue(e.target.value)
        }}
      />
    </Fragment>
  )
})

Inputs.displayName = 'Inputs'

export { Inputs }
