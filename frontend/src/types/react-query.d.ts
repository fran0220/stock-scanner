declare module '@tanstack/react-query-devtools' {
  import { ReactNode } from 'react'
  
  export interface ReactQueryDevtoolsProps {
    initialIsOpen?: boolean
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    panelProps?: any
    closeButtonProps?: any
    toggleButtonProps?: any
    children?: ReactNode
  }
  
  export const ReactQueryDevtools: React.FC<ReactQueryDevtoolsProps>
}
