import { useMemo, useState } from 'react'

const countries = [
  { name: 'Colombia', code: 'CO', dial: '+57', flag: '🇨🇴' },
  { name: 'Argentina', code: 'AR', dial: '+54', flag: '🇦🇷' },
  { name: 'Bolivia', code: 'BO', dial: '+591', flag: '🇧🇴' },
  { name: 'Brasil', code: 'BR', dial: '+55', flag: '🇧🇷' },
  { name: 'Canadá', code: 'CA', dial: '+1', flag: '🇨🇦' },
  { name: 'Chile', code: 'CL', dial: '+56', flag: '🇨🇱' },
  { name: 'Costa Rica', code: 'CR', dial: '+506', flag: '🇨🇷' },
  { name: 'Cuba', code: 'CU', dial: '+53', flag: '🇨🇺' },
  { name: 'Ecuador', code: 'EC', dial: '+593', flag: '🇪🇨' },
  { name: 'El Salvador', code: 'SV', dial: '+503', flag: '🇸🇻' },
  { name: 'España', code: 'ES', dial: '+34', flag: '🇪🇸' },
  { name: 'Estados Unidos', code: 'US', dial: '+1', flag: '🇺🇸' },
  { name: 'Francia', code: 'FR', dial: '+33', flag: '🇫🇷' },
  { name: 'Guatemala', code: 'GT', dial: '+502', flag: '🇬🇹' },
  { name: 'Honduras', code: 'HN', dial: '+504', flag: '🇭🇳' },
  { name: 'Italia', code: 'IT', dial: '+39', flag: '🇮🇹' },
  { name: 'México', code: 'MX', dial: '+52', flag: '🇲🇽' },
  { name: 'Nicaragua', code: 'NI', dial: '+505', flag: '🇳🇮' },
  { name: 'Panamá', code: 'PA', dial: '+507', flag: '🇵🇦' },
  { name: 'Paraguay', code: 'PY', dial: '+595', flag: '🇵🇾' },
  { name: 'Perú', code: 'PE', dial: '+51', flag: '🇵🇪' },
  { name: 'Portugal', code: 'PT', dial: '+351', flag: '🇵🇹' },
  { name: 'Puerto Rico', code: 'PR', dial: '+1', flag: '🇵🇷' },
  { name: 'Reino Unido', code: 'GB', dial: '+44', flag: '🇬🇧' },
  { name: 'República Dominicana', code: 'DO', dial: '+1', flag: '🇩🇴' },
  { name: 'Uruguay', code: 'UY', dial: '+598', flag: '🇺🇾' },
  { name: 'Venezuela', code: 'VE', dial: '+58', flag: '🇻🇪' },
]

type Props = {
  value: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
}

export default function CountryPhoneInput({ value, onChange, required = false, className = '' }: Props) {
  const [countryCode, setCountryCode] = useState(() => (
    countries.find(item => value.startsWith(`${item.dial} `) || value === item.dial)?.code ?? countries[0].code
  ))
  const selectedCountry = countries.find(item => item.code === countryCode) ?? countries[0]
  const country = useMemo(() => {
    const detected = countries.find(item => value.startsWith(`${item.dial} `) || value === item.dial)
    return detected && detected.dial !== selectedCountry.dial ? detected : selectedCountry
  }, [selectedCountry, value])
  const number = value.startsWith(country.dial) ? value.slice(country.dial.length).trimStart() : value

  return (
    <div className={`grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-2 ${className}`}>
      <select
        aria-label="País e indicativo telefónico"
        className="min-w-0 border border-gray-300 rounded-xl px-2 py-2 md:px-3 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
        value={country.code}
        required={required}
        onChange={event => {
          const selected = countries.find(item => item.code === event.target.value)
          if (selected) {
            setCountryCode(selected.code)
            onChange(`${selected.dial} ${number}`.trim())
          }
        }}
      >
        {countries.map(item => (
          <option key={item.code} value={item.code}>{item.flag} {item.name} ({item.dial})</option>
        ))}
      </select>
      <input
        type="tel"
        aria-label="Número de teléfono"
        className="min-w-0 border border-gray-300 rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
        placeholder="Número"
        autoComplete="tel-national"
        required={required}
        value={number}
        onChange={event => onChange(`${country.dial} ${event.target.value}`.trim())}
      />
    </div>
  )
}
