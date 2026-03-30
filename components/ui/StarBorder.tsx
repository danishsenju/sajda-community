import React from 'react'

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T
  className?: string
  children?: React.ReactNode
  color?: string
  speed?: React.CSSProperties['animationDuration']
  thickness?: number
}

const StarBorder = <T extends React.ElementType = 'button'>({
  as,
  className = '',
  color = '#059669',
  speed = '5s',
  thickness = 1,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = (as || 'button') as React.ElementType

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-[14px] ${className}`}
      {...(rest as object)}
      style={{
        padding: `${thickness}px 0`,
        ...((rest as { style?: React.CSSProperties }).style),
      }}
    >
      {/* Bottom star trail */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{ background: `radial-gradient(circle, ${color}, transparent 10%)`, animationDuration: speed }}
      />
      {/* Top star trail */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{ background: `radial-gradient(circle, ${color}, transparent 10%)`, animationDuration: speed }}
      />
      {/* Inner pill */}
      <div className="relative z-10 flex items-center justify-center gap-2 px-7 py-4 rounded-[13px] text-white font-semibold text-sm bg-gradient-to-b from-[#0a1f14] to-[#061209] border border-white/10">
        {children}
      </div>
    </Component>
  )
}

export default StarBorder
