'use client'

// Sticky scroll-triggered footer with 4 nav columns, giant title, social
// pills and animated background orbs — based on the Framer StickyFooter
// component spec, restyled to the cream / gold / ink brand and populated
// with Ali's actual links.

import { motion, type Variants } from 'framer-motion'
import { MessageCircle, Mail } from 'lucide-react'

// ── Framer-motion variant presets (verbatim from the StickyFooter spec) ──
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const linkVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const socialVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 10 },
  },
}

const backgroundVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 2, ease: 'easeOut' } },
}

// Small inline LinkedIn glyph — same one used elsewhere on the site
function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

// ── Ali's footer data ─────────────────────────────────────────────
const FOOTER = {
  sections: [
    {
      title: 'Engagements',
      links: [
        { label: 'Strategy Advisory', href: '#products' },
        { label: 'Digital Materials', href: '#products' },
        { label: '1:1 Consultations', href: '#book' },
        { label: 'The Course', href: '#course' },
      ],
    },
    {
      title: 'About',
      links: [
        { label: 'About Ali', href: '#about' },
        { label: 'The Gap', href: '#bridge' },
        { label: 'Services', href: '#services' },
        { label: 'Gallery', href: '#ai' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Free Diagnostic', href: '#course' },
        { label: 'AI Prompts', href: '#products' },
        { label: 'Frameworks', href: '#products' },
        { label: 'Templates', href: '#products' },
      ],
    },
    {
      title: 'Contact',
      links: [
        { label: 'Book a Call', href: '#book' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/alialali1' },
        { label: 'WhatsApp', href: 'https://wa.me/message' },
        { label: 'Email', href: 'mailto:hello@alialali.com' },
      ],
    },
  ],
  social: [
    {
      href: 'https://www.linkedin.com/in/alialali1',
      label: 'LinkedIn',
      Icon: LinkedinIcon,
    },
    {
      href: 'https://wa.me/message',
      label: 'WhatsApp',
      Icon: MessageCircle,
    },
    {
      href: 'mailto:hello@alialali.com',
      label: 'Email',
      Icon: Mail,
    },
  ],
  title: 'Ali Al-Ali',
  subtitle: 'Strategy · Execution · AI',
} as const

// ── Reusable atoms ────────────────────────────────────────────────
type NavSectionProps = {
  title: string
  links: ReadonlyArray<{ label: string; href: string }>
  index: number
}

function NavSection({ title, links, index }: NavSectionProps) {
  return (
    <motion.div variants={itemVariants} custom={index} className="ali-sf-col">
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
        className="ali-sf-col-title"
      >
        {title}
      </motion.h3>
      {links.map(link => (
        <motion.a
          key={link.label}
          variants={linkVariants}
          href={link.href}
          target={link.href.startsWith('http') || link.href.startsWith('mailto') ? '_blank' : undefined}
          rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          whileHover={{
            x: 8,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
          }}
          className="ali-sf-link"
        >
          <span className="ali-sf-link-label">
            {link.label}
            <motion.span
              className="ali-sf-link-underline"
              initial={{ width: 0 }}
              whileHover={{ width: '100%' }}
              transition={{ duration: 0.3 }}
            />
          </span>
        </motion.a>
      ))}
    </motion.div>
  )
}

type SocialLinkProps = {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number }>
  index: number
}

function SocialLink({ href, label, Icon, index }: SocialLinkProps) {
  return (
    <motion.a
      variants={socialVariants}
      custom={index}
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      whileHover={{
        scale: 1.2,
        rotate: 12,
        transition: { type: 'spring', stiffness: 300, damping: 15 },
      }}
      whileTap={{ scale: 0.9 }}
      className="ali-sf-social"
      aria-label={label}
    >
      <Icon size={16} />
    </motion.a>
  )
}

// ── Footer ────────────────────────────────────────────────────────
export default function AliCinematicFooter() {
  return (
    <div className="ali-sf-wrap">
      <div className="ali-sf-rail">
        <div className="ali-sf-sticky">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="ali-sf"
          >
            {/* Soft top-fade overlay */}
            <div className="ali-sf-veil" aria-hidden />

            {/* Animated background orbs */}
            <motion.div
              variants={backgroundVariants}
              className="ali-sf-orb ali-sf-orb--tr"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              variants={backgroundVariants}
              className="ali-sf-orb ali-sf-orb--bl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />

            {/* Nav grid */}
            <motion.div variants={containerVariants} className="ali-sf-nav">
              <div className="ali-sf-nav-grid">
                {FOOTER.sections.map((section, i) => (
                  <NavSection key={section.title} title={section.title} links={section.links} index={i} />
                ))}
              </div>
            </motion.div>

            {/* Bottom row: giant title + copyright/social */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
              className="ali-sf-bottom"
            >
              <div className="ali-sf-bottom-left">
                <motion.h1
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
                  whileHover={{
                    scale: 1.02,
                    transition: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                  className="ali-sf-title"
                >
                  {FOOTER.title}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="ali-sf-subtitle-row"
                >
                  <motion.div
                    className="ali-sf-rule"
                    animate={{ scaleX: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                    className="ali-sf-subtitle"
                  >
                    {FOOTER.subtitle}
                  </motion.p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="ali-sf-bottom-right"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  className="ali-sf-copyright"
                >
                  © {new Date().getFullYear()} Ali Al-Ali · All rights reserved
                </motion.p>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 2, staggerChildren: 0.1 }}
                  className="ali-sf-social-row"
                >
                  {FOOTER.social.map((social, i) => (
                    <SocialLink
                      key={social.label}
                      href={social.href}
                      label={social.label}
                      Icon={social.Icon}
                      index={i}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
