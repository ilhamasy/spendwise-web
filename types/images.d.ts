declare module '*.png' {
  const value: {
    src: string
    height: number
    width: number
    blurDataURL?: string
    blurWidth?: number
    blurHeight?: number
  }
  export default value
}

declare module '*.jpg' {
  const value: {
    src: string
    height: number
    width: number
    blurDataURL?: string
    blurWidth?: number
    blurHeight?: number
  }
  export default value
}

declare module '*.svg' {
  import React from 'react'
  const SVGComponent: React.FC<React.SVGProps<SVGSVGElement>>
  export default SVGComponent
}
