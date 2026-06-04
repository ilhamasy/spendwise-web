declare module '*.png' {
  const value: string
  export default value
}

declare module '*.jpg' {
  const value: string
  export default value
}

declare module '*.svg' {
  import React from 'react'
  const SVGComponent: React.FC<React.SVGProps<SVGSVGElement>>
  export default SVGComponent
}
