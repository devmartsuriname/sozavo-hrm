// Temporary type stubs for external packages not yet installed
// These will be replaced when proper dependencies are added in Phase 5 - Final Configuration

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

// React Bootstrap
declare module 'react-bootstrap' {
  import { ComponentType, ReactNode, HTMLAttributes, FormHTMLAttributes, ButtonHTMLAttributes } from 'react'
  
  export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode
    className?: string
  }
  export const Card: ComponentType<CardProps> & {
    Header: ComponentType<CardProps>
    Body: ComponentType<CardProps>
    Footer: ComponentType<CardProps>
    Title: ComponentType<CardProps>
    Text: ComponentType<CardProps>
    Img: ComponentType<any>
  }
  export const CardBody: ComponentType<any>
  export const CardTitle: ComponentType<any>
  export const CardHeader: ComponentType<any>
  export const CardFooter: ComponentType<any>
  
  export const Row: ComponentType<any>
  export const Col: ComponentType<any>
  export const Container: ComponentType<any>
  export const Button: ComponentType<any>
  
  export const Dropdown: ComponentType<any> & {
    Toggle: ComponentType<any>
    Menu: ComponentType<any>
    Item: ComponentType<any>
    Divider: ComponentType<any>
    Header: ComponentType<any>
  }
  export const DropdownToggle: ComponentType<any>
  export const DropdownMenu: ComponentType<any>
  export const DropdownItem: ComponentType<any>
  export const DropdownHeader: ComponentType<any>
  export const DropdownDivider: ComponentType<any>
  
  export const Nav: ComponentType<any> & { Item: ComponentType<any>; Link: ComponentType<any> }
  export const Form: ComponentType<any> & {
    Group: ComponentType<any>
    Label: ComponentType<any>
    Control: ComponentType<any>
    Check: ComponentType<any>
    Select: ComponentType<any>
    Text: ComponentType<any>
    Range: ComponentType<any>
    Floating: ComponentType<any>
  }
  export const FormControl: ComponentType<any>
  export const FormGroup: ComponentType<any>
  export const FormLabel: ComponentType<any>
  export const FormCheck: ComponentType<any>
  export const FormSelect: ComponentType<any>
  export const FormText: ComponentType<any>
  export const FloatingLabel: ComponentType<any>
  
  export const Offcanvas: ComponentType<any> & {
    Header: ComponentType<any>
    Title: ComponentType<any>
    Body: ComponentType<any>
  }
  export const OffcanvasHeader: ComponentType<any>
  export const OffcanvasBody: ComponentType<any>
  export const OffcanvasTitle: ComponentType<any>
  
  export const Modal: ComponentType<any> & {
    Header: ComponentType<any>
    Title: ComponentType<any>
    Body: ComponentType<any>
    Footer: ComponentType<any>
    Dialog: ComponentType<any>
  }
  
  export const Badge: ComponentType<any>
  export const Alert: ComponentType<any>
  export const Breadcrumb: ComponentType<any> & { Item: ComponentType<any> }
  export const Collapse: ComponentType<any>
  export const Accordion: ComponentType<any> & { Item: ComponentType<any>; Header: ComponentType<any>; Body: ComponentType<any> }
  export const Tab: ComponentType<any> & { Container: ComponentType<any>; Content: ComponentType<any>; Pane: ComponentType<any> }
  export const Tabs: ComponentType<any>
  export const ListGroup: ComponentType<any> & { Item: ComponentType<any> }
  export const Table: ComponentType<any>
  export const Spinner: ComponentType<any>
  export const ProgressBar: ComponentType<any>
  export const Pagination: ComponentType<any> & { Item: ComponentType<any>; First: ComponentType<any>; Prev: ComponentType<any>; Next: ComponentType<any>; Last: ComponentType<any>; Ellipsis: ComponentType<any> }
  export const Tooltip: ComponentType<any>
  export const OverlayTrigger: ComponentType<any>
  export const Popover: ComponentType<any> & { Header: ComponentType<any>; Body: ComponentType<any> }
  export const Carousel: ComponentType<any> & { Item: ComponentType<any>; Caption: ComponentType<any> }
  export const InputGroup: ComponentType<any> & { Text: ComponentType<any> }
  export const Image: ComponentType<any>
  export const Figure: ComponentType<any>
  export const Navbar: ComponentType<any> & { Brand: ComponentType<any>; Toggle: ComponentType<any>; Collapse: ComponentType<any> }
  export const CloseButton: ComponentType<any>
  export const Stack: ComponentType<any>
  export const Placeholder: ComponentType<any>
  export const Ratio: ComponentType<any>
  export const Toast: ComponentType<any> & { Header: ComponentType<any>; Body: ComponentType<any> }
  export const ToastContainer: ComponentType<any>
  export const ToastHeader: ComponentType<any>
  export const ToastBody: ComponentType<any>
}

declare module 'react-bootstrap/esm/Feedback' {
  import { ComponentType } from 'react'
  const Feedback: ComponentType<any>
  export default Feedback
}

declare module 'react-bootstrap/Toast' {
  import { ComponentType } from 'react'
  export interface ToastProps {
    show?: boolean
    onClose?: () => void
    delay?: number
    autohide?: boolean
    animation?: boolean
    bg?: string
    className?: string
    children?: React.ReactNode
  }
  const Toast: ComponentType<ToastProps> & {
    Header: ComponentType<any>
    Body: ComponentType<any>
  }
  export default Toast
}

declare module 'react-bootstrap/ToastContainer' {
  import { ComponentType } from 'react'
  export interface ToastContainerProps {
    position?: string
    className?: string
    children?: React.ReactNode
  }
  const ToastContainer: ComponentType<ToastContainerProps>
  export default ToastContainer
}

// Flatpickr
declare module 'react-flatpickr' {
  import { ComponentType } from 'react'
  interface FlatpickrProps {
    value?: Date | string | Date[]
    onChange?: (dates: Date[], currentDateString: string) => void
    options?: any
    className?: string
    placeholder?: string
    disabled?: boolean
    name?: string
    id?: string
  }
  const Flatpickr: ComponentType<FlatpickrProps>
  export default Flatpickr
}

// Helmet
declare module 'react-helmet-async' {
  import { ComponentType, ReactNode } from 'react'
  export interface HelmetProps {
    children?: ReactNode
  }
  export const Helmet: ComponentType<HelmetProps>
  export const HelmetProvider: ComponentType<{ children?: ReactNode }>
}

// Choices.js
declare module 'choices.js' {
  export interface ChoicesOptions {
    removeItemButton?: boolean
    searchEnabled?: boolean
    placeholder?: boolean
    placeholderValue?: string
    [key: string]: any
  }
  class Choices {
    constructor(element: HTMLElement | string, options?: ChoicesOptions)
    destroy(): void
    disable(): void
    enable(): void
    getValue(valueOnly?: boolean): any
    setValue(items: any[]): void
    setChoices(choices: any[], value?: string, label?: string, replaceChoices?: boolean): void
    clearStore(): void
    clearInput(): void
    removeActiveItems(excludedId?: number): void
    removeHighlightedItems(runEvent?: boolean): void
  }
  export default Choices
}

// React Dropzone
declare module 'react-dropzone' {
  import { ComponentType } from 'react'
  export interface DropzoneState {
    isDragActive: boolean
    isDragAccept: boolean
    isDragReject: boolean
    acceptedFiles: File[]
    getRootProps: (props?: any) => any
    getInputProps: (props?: any) => any
    open: () => void
  }
  export interface DropzoneOptions {
    accept?: Record<string, string[]>
    disabled?: boolean
    maxSize?: number
    minSize?: number
    multiple?: boolean
    maxFiles?: number
    onDrop?: (acceptedFiles: File[], rejectedFiles: any[]) => void
    onDropAccepted?: (files: File[]) => void
    onDropRejected?: (files: any[]) => void
    noClick?: boolean
    noKeyboard?: boolean
    noDrag?: boolean
  }
  export function useDropzone(options?: DropzoneOptions): DropzoneState
  export interface DropzoneProps extends DropzoneOptions {
    children?: (state: DropzoneState) => React.ReactNode
  }
  const Dropzone: ComponentType<DropzoneProps>
  export default Dropzone
}

// React Toastify
declare module 'react-toastify' {
  import { ComponentType, ReactNode } from 'react'
  export interface ToastContainerProps {
    position?: string
    autoClose?: number | false
    hideProgressBar?: boolean
    newestOnTop?: boolean
    closeOnClick?: boolean
    rtl?: boolean
    pauseOnFocusLoss?: boolean
    draggable?: boolean
    pauseOnHover?: boolean
    theme?: string
    className?: string
  }
  export const ToastContainer: ComponentType<ToastContainerProps>
  export interface ToastOptions {
    position?: string
    autoClose?: number | false
    hideProgressBar?: boolean
    closeOnClick?: boolean
    pauseOnHover?: boolean
    draggable?: boolean
    progress?: number
    theme?: string
    type?: string
  }
  export const toast: {
    (content: ReactNode, options?: ToastOptions): void
    success: (content: ReactNode, options?: ToastOptions) => void
    error: (content: ReactNode, options?: ToastOptions) => void
    warn: (content: ReactNode, options?: ToastOptions) => void
    info: (content: ReactNode, options?: ToastOptions) => void
    dismiss: (id?: string | number) => void
  }
}

// Simplebar
declare module 'simplebar-core' {
  export interface SimpleBarOptions {
    autoHide?: boolean
    scrollbarMinSize?: number
    scrollbarMaxSize?: number
    classNames?: Record<string, string>
    forceVisible?: boolean | string
    direction?: string
    timeout?: number
    clickOnTrack?: boolean
  }
  export default class SimpleBar {
    constructor(element: HTMLElement, options?: SimpleBarOptions)
    recalculate(): void
    getScrollElement(): HTMLElement
    getContentElement(): HTMLElement
    unMount(): void
  }
}

declare module 'simplebar-react' {
  import { ComponentType, HTMLAttributes, RefObject } from 'react'
  import { SimpleBarOptions } from 'simplebar-core'
  export interface SimpleBarReactProps extends HTMLAttributes<HTMLDivElement>, SimpleBarOptions {
    scrollableNodeProps?: any
    children?: React.ReactNode
  }
  const SimpleBar: ComponentType<SimpleBarReactProps>
  export default SimpleBar
}

// Cookies Next
declare module 'cookies-next' {
  export interface CookieOptions {
    maxAge?: number
    expires?: Date
    path?: string
    domain?: string
    secure?: boolean
    httpOnly?: boolean
    sameSite?: boolean | 'lax' | 'strict' | 'none'
  }
  export function setCookie(key: string, value: any, options?: CookieOptions): void
  export function getCookie(key: string, options?: any): string | undefined
  export function deleteCookie(key: string, options?: CookieOptions): void
  export function hasCookie(key: string, options?: any): boolean
  export function getCookies(options?: any): Record<string, string>
}

// Yup
declare module 'yup' {
  export interface StringSchema {
    required(message?: string): StringSchema
    email(message?: string): StringSchema
    min(limit: number, message?: string): StringSchema
    max(limit: number, message?: string): StringSchema
    matches(regex: RegExp, message?: string): StringSchema
    oneOf(values: any[], message?: string): StringSchema
    nullable(): StringSchema
    optional(): StringSchema
    label(label: string): StringSchema
  }
  export interface NumberSchema {
    required(message?: string): NumberSchema
    min(limit: number, message?: string): NumberSchema
    max(limit: number, message?: string): NumberSchema
    positive(message?: string): NumberSchema
    negative(message?: string): NumberSchema
    integer(message?: string): NumberSchema
    nullable(): NumberSchema
    optional(): NumberSchema
  }
  export interface BooleanSchema {
    required(message?: string): BooleanSchema
    nullable(): BooleanSchema
    optional(): BooleanSchema
  }
  export interface DateSchema {
    required(message?: string): DateSchema
    min(limit: Date | string, message?: string): DateSchema
    max(limit: Date | string, message?: string): DateSchema
    nullable(): DateSchema
    optional(): DateSchema
  }
  export interface ArraySchema<T = any> {
    required(message?: string): ArraySchema<T>
    min(limit: number, message?: string): ArraySchema<T>
    max(limit: number, message?: string): ArraySchema<T>
    of(schema: any): ArraySchema<T>
    nullable(): ArraySchema<T>
    optional(): ArraySchema<T>
  }
  export interface ObjectSchema<T = any> {
    shape(fields: Record<string, any>): ObjectSchema<T>
    required(message?: string): ObjectSchema<T>
    nullable(): ObjectSchema<T>
    optional(): ObjectSchema<T>
  }
  export function string(): StringSchema
  export function number(): NumberSchema
  export function boolean(): BooleanSchema
  export function date(): DateSchema
  export function array<T = any>(): ArraySchema<T>
  export function object<T = any>(): ObjectSchema<T>
  export function ref(path: string): any
  export function lazy(fn: (value: any) => any): any
  export const mixed: () => any
}

// Axios
declare module 'axios' {
  export interface AxiosRequestConfig {
    url?: string
    method?: string
    baseURL?: string
    headers?: Record<string, string>
    params?: any
    data?: any
    timeout?: number
    withCredentials?: boolean
    responseType?: string
    [key: string]: any
  }
  export interface AxiosResponse<T = any> {
    data: T
    status: number
    statusText: string
    headers: Record<string, string>
    config: AxiosRequestConfig
  }
  export interface AxiosError<T = any> extends Error {
    config: AxiosRequestConfig
    code?: string
    request?: any
    response?: AxiosResponse<T>
    isAxiosError: boolean
  }
  export interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<AxiosResponse>
    (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>
    defaults: AxiosRequestConfig
    interceptors: {
      request: any
      response: any
    }
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
    options<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
  }
  export function create(config?: AxiosRequestConfig): AxiosInstance
  const axios: AxiosInstance & {
    create: typeof create
    isAxiosError(payload: any): payload is AxiosError
  }
  export default axios
}

// Axios Mock Adapter
declare module 'axios-mock-adapter' {
  import { AxiosInstance, AxiosRequestConfig } from 'axios'
  class MockAdapter {
    constructor(axios: AxiosInstance, options?: { delayResponse?: number; onNoMatch?: string })
    onGet(url?: string | RegExp, body?: any): MockAdapter
    onPost(url?: string | RegExp, body?: any): MockAdapter
    onPut(url?: string | RegExp, body?: any): MockAdapter
    onPatch(url?: string | RegExp, body?: any): MockAdapter
    onDelete(url?: string | RegExp, body?: any): MockAdapter
    onHead(url?: string | RegExp, body?: any): MockAdapter
    onOptions(url?: string | RegExp, body?: any): MockAdapter
    onAny(url?: string | RegExp, body?: any): MockAdapter
    reply(status: number, data?: any, headers?: Record<string, string>): MockAdapter
    replyOnce(status: number, data?: any, headers?: Record<string, string>): MockAdapter
    passThrough(): MockAdapter
    networkError(): MockAdapter
    networkErrorOnce(): MockAdapter
    timeout(): MockAdapter
    timeoutOnce(): MockAdapter
    reset(): void
    restore(): void
    resetHistory(): void
    history: Record<string, AxiosRequestConfig[]>
  }
  export default MockAdapter
}

// JVectorMap
declare module 'jsvectormap' {
  export interface JsvectormapOptions {
    map?: string
    selector?: string | HTMLElement
    backgroundColor?: string
    draggable?: boolean
    zoomButtons?: boolean
    zoomOnScroll?: boolean
    zoomOnScrollSpeed?: number
    zoomMax?: number
    zoomMin?: number
    zoomAnimate?: boolean
    showTooltip?: boolean
    zoomStep?: number
    focusOn?: any
    markers?: any[]
    markerStyle?: any
    markerLabelStyle?: any
    markersSelectable?: boolean
    markersSelectableOne?: boolean
    lines?: any[]
    lineStyle?: any
    selectedMarkers?: number[]
    selectedRegions?: string[]
    regionStyle?: any
    regionLabelStyle?: any
    regionsSelectable?: boolean
    regionsSelectableOne?: boolean
    series?: any
    visualizeData?: any
    labels?: any
    onLoaded?: (map: any) => void
    onViewportChange?: (scale: number, transX: number, transY: number) => void
    onRegionClick?: (event: any, code: string) => void
    onRegionSelected?: (code: string, isSelected: boolean, selectedRegions: string[]) => void
    onMarkerClick?: (event: any, markerIndex: number) => void
    onMarkerSelected?: (markerIndex: number, isSelected: boolean, selectedMarkers: number[]) => void
    onRegionTooltipShow?: (event: any, tooltip: any, code: string) => void
    onMarkerTooltipShow?: (event: any, tooltip: any, markerIndex: number) => void
  }
  class Jsvectormap {
    constructor(options: JsvectormapOptions)
    setSelected(type: string, keys: string[]): void
    clearSelected(type: string): void
    getSelected(type: string): string[]
    addMarkers(markers: any[]): void
    removeMarkers(): void
    addLine(from: string, to: string, style?: any): void
    removeLines(): void
    reset(): void
    destroy(): void
    extend(name: string, value: any): void
    getMap(name: string): any
  }
  export default Jsvectormap
}

declare module 'jsvectormap/dist/maps/world' {}
declare module 'jsvectormap/dist/maps/canada' {}
declare module 'jsvectormap/dist/maps/spain' {}
declare module 'jsvectormap/dist/maps/iraq' {}
declare module 'jsvectormap/dist/maps/russia' {}