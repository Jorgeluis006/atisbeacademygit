export default function WhatsAppButton() {
  const phone = '573000000000' // TODO: reemplazar con número real
  const message = encodeURIComponent('Hola Atisbe, me gustaría obtener más información.')
  const href = `https://wa.me/${phone}?text=${message}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-soft hover:scale-105 transition-transform"
      aria-label="WhatsApp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
        <path d="M12.04 2C6.58 2 2.16 6.42 2.16 11.88c0 2.09.59 4.03 1.62 5.67L2 22l4.58-1.75a10.03 10.03 0 0 0 5.46 1.59c5.46 0 9.88-4.42 9.88-9.88C21.92 6.42 17.5 2 12.04 2Zm5.79 14.19c-.24.67-1.38 1.28-1.9 1.36-.49.08-1.12.11-1.81-.11-.42-.13-.96-.31-1.65-.61-2.91-1.26-4.81-4.21-4.96-4.41-.14-.2-1.19-1.59-1.19-3.03 0-1.44.76-2.14 1.03-2.44.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.83 2 .9 2.14.07.14.12.3.02.49-.1.2-.15.32-.29.5-.14.18-.3.41-.43.55-.14.14-.28.3-.12.6.16.3.72 1.19 1.55 1.93 1.07.95 1.98 1.24 2.28 1.38.3.14.48.12.66-.07.18-.2.76-.88.96-1.18.2-.3.4-.25.66-.15.27.1 1.68.79 1.97.93.29.14.48.21.55.33.07.12.07.67-.17 1.34Z"/>
      </svg>
    </a>
  )
}
