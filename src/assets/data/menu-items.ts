import { MenuItemType } from '@/types/menu'

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'menu',
    label: 'MENU',
    isTitle: true,
  },
  {
    key: 'dashboards',
    label: 'Dashboard',
    icon: 'mingcute:home-3-line',
    url: '/dashboards',
  },
  // ====================HRM===============
  {
    key: 'hrm',
    label: 'HRM',
    isTitle: true,
  },
  {
    key: 'hrm-employees',
    label: 'Employees',
    icon: 'mingcute:group-line',
    url: '/hrm/employees',
  },
  {
    key: 'hrm-org-units',
    label: 'Organization Units',
    icon: 'mingcute:building-3-line',
    url: '/hrm/org-units',
  },
  {
    key: 'hrm-positions',
    label: 'Positions',
    icon: 'mingcute:briefcase-line',
    url: '/hrm/positions',
  },
  {
    key: 'hrm-users',
    label: 'Users & Roles',
    icon: 'mingcute:user-setting-line',
    url: '/hrm/users',
  },
]
