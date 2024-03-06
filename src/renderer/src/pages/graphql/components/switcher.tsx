'use client'

import * as React from 'react'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup
} from '@/components/ui/command'
import { Dialog } from '@/components/ui/dialog'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GraphqlOptionsProps } from '../page'

export type Option = {
  label: string
  group: {
    value: string
    label: string
    type: string
  }[]
}[]

interface TeamSwitcherProps {
  options?: GraphqlOptionsProps[]
  className?: string
  value?: string
  onChange?: (value: string) => void
}

export default function Switcher({ className, options = [], value, onChange }: TeamSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState('')

  return (
    <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a label"
            className={cn('w-[750px] justify-between', className)}
          >
            {selectedLabel}
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[750px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="请输入..." />
              <CommandEmpty>没有找到</CommandEmpty>
              {options.map((item) => {
                return (
                  <CommandGroup key={item.label} heading={item.label}>
                    {item.dataSource
                      .sort((a, b) => {
                        const nameA = a.value.toUpperCase()
                        const nameB = b.value.toUpperCase()
                        if (nameA < nameB) {
                          return -1
                        }
                        if (nameA > nameB) {
                          return 1
                        }
                        return 0
                      })
                      .map((option) => (
                        <CommandItem
                          key={option.value}
                          onSelect={() => {
                            onChange?.(option.value)
                            setSelectedLabel(`${option.value}-${option.label}`)
                            setOpen(false)
                          }}
                          className="text-sm"
                        >
                          <div className="w-full">
                            <div>{option.value}</div>
                            <div className="text-gray-400">{option.label}</div>
                          </div>

                          <CheckIcon
                            className={cn(
                              'ml-auto h-4 w-4',
                              value === option.value ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </Dialog>
  )
}
