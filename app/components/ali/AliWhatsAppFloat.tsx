'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'

export default function AliWhatsAppFloat() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show) return null

  return (
    <a
      href="https://wa.me/message"
      target="_blank"
      rel="noopener noreferrer"
      className="ali-whatsapp-float"
      aria-label="Message Ali on WhatsApp"
    >
      <MessageCircle size={26} strokeWidth={2.2} />
    </a>
  )
}
