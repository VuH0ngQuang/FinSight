import { formatPrice } from '../../utils/formatters'

const PriceTag = ({
  price,
  isFlashing = false,
  size = 'md',
}: {
  price: number | null | undefined
  isFlashing?: boolean
  size?: 'sm' | 'md' | 'lg'
}) => {
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base'
  return (
    <span
      className={`font-mono font-semibold transition-all duration-300 rounded px-1 ${sizeClass} ${
        isFlashing
          ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
          : 'text-slate-900'
      }`}
    >
      {formatPrice(price)}
    </span>
  )
}

export default PriceTag
