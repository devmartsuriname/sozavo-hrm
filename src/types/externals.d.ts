// Temporary type stubs for external packages not yet installed
// These will be replaced when proper dependencies are added in Phase 4-5

declare module '@iconify/react' {
  export interface IconProps {
    icon: string
    width?: number | string
    height?: number | string
    color?: string
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
  }
  export const Icon: React.FC<IconProps>
}

declare module '@fullcalendar/core/index.js' {
  export interface EventInput {
    id?: string
    title?: string
    start?: Date | string
    end?: Date | string
    allDay?: boolean
    className?: string
    editable?: boolean
    [key: string]: any
  }
  export interface EventClickArg {
    event: any
    el: HTMLElement
    jsEvent: MouseEvent
  }
  export interface EventDropArg {
    event: any
    oldEvent: any
    delta: any
  }
}

declare module '@fullcalendar/interaction/index.js' {
  export interface DateClickArg {
    date: Date
    dateStr: string
    allDay: boolean
    jsEvent: MouseEvent
  }
  export interface DropArg {
    date: Date
    dateStr: string
    allDay: boolean
    draggedEl: HTMLElement
    jsEvent: MouseEvent
  }
}