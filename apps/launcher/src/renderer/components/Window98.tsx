import React, { ReactNode } from 'react'

interface Window98Props {
  children: ReactNode
}

const Window98: React.FC<Window98Props> = ({ children }) => {
  return (
    <div className="window">
      {children}
    </div>
  )
}

export default Window98
