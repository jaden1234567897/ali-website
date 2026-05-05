'use client'

import { motion } from 'framer-motion'
import { CalendarClock, MessageCircle } from 'lucide-react'

export default function AliBooking() {
  return (
    <section id="book" className="ali-booking">
      <motion.div
        className="ali-booking-card"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="ali-booking-corner ali-booking-corner--tl" aria-hidden="true" />
        <span className="ali-booking-corner ali-booking-corner--tr" aria-hidden="true" />
        <span className="ali-booking-corner ali-booking-corner--bl" aria-hidden="true" />
        <span className="ali-booking-corner ali-booking-corner--br" aria-hidden="true" />

        <p className="ali-eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>
          Ready to close the gap?
        </p>
        <h2>Start the conversation</h2>
        <p>
          Book a free 45-minute discovery call. No pitch, no pressure —
          just an honest conversation about where you are and where you want to be.
        </p>

        <div className="ali-booking-actions">
          <a
            href="https://cal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ali-btn ali-btn--primary"
          >
            <CalendarClock size={16} />
            Book a Free Call
          </a>
          <a
            href="https://wa.me/message"
            target="_blank"
            rel="noopener noreferrer"
            className="ali-btn ali-btn--whatsapp"
          >
            <MessageCircle size={16} />
            WhatsApp Ali
          </a>
        </div>

        <p className="ali-booking-meta">Free · 45 minutes · No commitment</p>
      </motion.div>
    </section>
  )
}
