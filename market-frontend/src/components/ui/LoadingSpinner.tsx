const LoadingSpinner = ({ fullScreen = false, size = 'md', label }: {
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}) => {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6'
  const spinner = (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClass} animate-spin rounded-full border-2 border-slate-200 border-t-blue-600`} />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  )
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    )
  }
  return <div className="flex items-center justify-center p-8">{spinner}</div>
}

export default LoadingSpinner
