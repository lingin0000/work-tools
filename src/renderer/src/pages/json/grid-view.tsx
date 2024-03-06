import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

/**
 * @description 展示json数据的grid视图
 */

function _TableCell(props: { value: any }) {
  const { value } = props
  if (Array.isArray(value)) {
    return (
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            {<Button variant="secondary">{value.length}items</Button>}
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="w-[1024px] h-96">
              <ArrayView value={value} />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }
  if (typeof value === 'object') {
    return (
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            {<Button variant="secondary">{Object.keys(value).length}items</Button>}
          </AccordionTrigger>
          <AccordionContent>
            <ObjectView value={value} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }
  return <span>{String(value)}</span>
}

function ArrayView(props: { value: any[] }) {
  const { value } = props
  const keys = Object.keys(value[0])
  return (
    <Table className="border-r border-t border-b">
      <TableHeader>
        <TableRow>
          {keys.map((item) => (
            <TableHead key={item} className="border-l">
              {item}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {value.map((item, index) => (
          <TableRow key={index}>
            {keys.map((_item) => (
              <TableCell key={_item} className=" border-l">
                <_TableCell value={item[_item]} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ObjectView(props: { value: Record<string, any> }) {
  const keys = Object.keys(props.value)
  const values = Object.values(props.value)
  return (
    <Table className="border-r border-t border-b">
      <TableBody>
        {keys.map((key, index) => (
          <TableRow key={index}>
            <TableCell className="border-l font-bold">{key}</TableCell>
            <TableCell className="border-l">
              <_TableCell value={values[index]} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function GridView(props: { value: Record<string, any> | Record<string, any>[] }) {
  const { value } = props
  // 如果是数组直接用table展示
  if (Array.isArray(value)) {
    return <ArrayView value={value} />
  }

  // 如果是对象，要先把对象转换成数组
  return <ObjectView value={value} />
}
