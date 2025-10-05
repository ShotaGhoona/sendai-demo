"use client"

import {
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Package,
  Warehouse,
  Store,
  Calendar,
  Users,
  Bot,
} from "lucide-react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../shadcnui/ui/sidebar"

const menuItems = [
  {
    title: "商品発注",
    icon: ShoppingCart,
    items: [
      {
        title: "メーカー発注",
        href: "/order/manufacturer",
      },
      {
        title: "店舗発注",
        href: "/order/store",
      },
    ],
  },
  {
    title: "分析",
    icon: TrendingUp,
    items: [
      {
        title: "全体店舗分析",
        href: "/analysis/overview",
      },
      {
        title: "新商品発注検討",
        href: "/analysis/new-product",
      },
      {
        title: "AIエージェント",
        href: "/analysis/ai-agent",
      },
    ],
  },
  {
    title: "商品管理",
    icon: Package,
    items: [
      {
        title: "商品マスター",
        href: "/master/product",
      },
      {
        title: "倉庫マスター",
        href: "/master/warehouse",
      },
      {
        title: "店舗マスター",
        href: "/master/store",
      },
      {
        title: "イベントマスター",
        href: "/master/event",
      },
      {
        title: "ユーザーマスター",
        href: "/master/user",
      },
    ],
  },
]

export function AppSidebar() {

  return (
    <Sidebar collapsible="none" className="h-screen border-r" style={{ width: "240px", minWidth: "240px" }}>
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 shadow-sm">
            <BarChart3 className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">SendAI</h1>
            <p className="text-xs text-white/80">システム</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        {menuItems.map((group) => (
          <SidebarGroup key={group.title} className="mb-6">
            <SidebarGroupLabel className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white">
              <group.icon className="h-4 w-4" />
              <span>{group.title}</span>
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="w-full">
                      <Link 
                        href={item.href}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white transition-all duration-200 hover:bg-white/10 hover:translate-x-1 ml-6"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
                        <span className="flex-1">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}