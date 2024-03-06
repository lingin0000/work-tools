import { SidebarNavProps } from '@/components/ui/sidebar-nav'
import { GitPullRequestArrow, PenToolIcon } from 'lucide-react'

export const menu: SidebarNavProps['groups'] = [
  {
    title: 'tools',
    items: [
      {
        title: 'Graphql',
        href: '/graphql',
        icon: GitPullRequestArrow
      },
      {
        title: 'Json工具',
        href: '/json',
        icon: PenToolIcon
      }
    ]
  }
  // {
  //   title: "知识点",
  //   items: [
  //     {
  //       title: "design-pattern",
  //       href: "/design-pattern",
  //       icon: LucideDivideSquare,
  //     },
  //   ],
  // },
]
