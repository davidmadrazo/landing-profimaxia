'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import {
  Smartphone, Cpu, Megaphone,
  X, Rocket, Code, Heart, ArrowDown, ArrowRight,
  PhoneOff, Clock, UserX, Menu,
} from 'lucide-react'
import { ChatWidget } from '@/features/chat/components/ChatWidget'

const WHATSAPP_NUMBER = '+34 644 357 558'
const WHATSAPP_URL = `https://wa.me/34644357558?text=${encodeURIComponent('Hola, tengo una idea y me gustaria saber como hacerla realidad')}`

const SOLUTIONS = [
  {
    icon: Smartphone,
    title: 'Construimos tu app',
    desc: 'Tu idea convertida en software real. Apps, plataformas, herramientas internas — todo hecho a medida. En semanas, no meses.',
    tags: ['Apps a medida', 'Plataformas', 'MVPs'],
    highlight: true,
  },
  {
    icon: Cpu,
    title: 'Automatizamos tu negocio',
    desc: 'Bots de WhatsApp, llamadas con IA, CRM inteligente. Tu negocio atiende, responde y gestiona sin que estes delante.',
    tags: ['Bots WhatsApp', 'Llamadas IA', 'CRM'],
    highlight: false,
  },
  {
    icon: Megaphone,
    title: 'Vendemos por ti',
    desc: 'Landing pages que convierten, webs que posicionan, funnels que captan. Captacion en piloto automatico.',
    tags: ['Landing Pages', 'Webs', 'Funnels'],
    highlight: false,
  },
]

const PAIN_POINTS = [
  {
    icon: PhoneOff,
    stat: '67%',
    text: 'de los clientes no vuelven si no les respondes en 5 minutos.',
    subtext: 'Tu competencia ya les respondio.',
  },
  {
    icon: Clock,
    stat: '8 horas',
    text: 'es lo que tarda un negocio de media en responder a un cliente.',
    subtext: 'Los que automatizan responden en segundos.',
  },
  {
    icon: UserX,
    stat: '3 de 5',
    text: 'negocios pierden clientes por no tener automatizacion.',
    subtext: 'Funcionan a mano. Y se nota.',
  },
]

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Nos cuentas tu idea',
    desc: '30 minutos por WhatsApp, sin compromiso. Tu nos dices que necesita tu negocio, nosotros te decimos exactamente como lo construimos.',
  },
  {
    num: '02',
    title: 'La convertimos en software',
    desc: 'Diseñamos y desarrollamos tu solucion desde cero. En semanas, no meses. Te mostramos cada avance hasta que sea exactamente lo que imaginas.',
  },
  {
    num: '03',
    title: 'Tu negocio trabaja solo',
    desc: 'Lo lanzamos y tu negocio empieza a atender, vender y gestionar sin que estes delante. 24 horas, 7 dias.',
  },
]

const PROJECTS = [
  { name: 'JMCakesss', desc: 'Bot de WhatsApp para pasteleria artesanal. Atiende pedidos y consultas 24/7.', result: 'Pedidos automatizados sin intervenir', tag: 'Bot WhatsApp', active: true, img: '/projects/jmcakesss.png', url: 'https://cakesss.es/' },
  { name: 'Oxford LS', desc: 'Bot de WhatsApp para academia de ingles. Redirige leads y gestiona consultas automaticamente.', result: 'Leads captados sin perder ni uno', tag: 'Bot WhatsApp', active: true, img: null, url: 'https://oxfordls.com/' },
  { name: 'Montchis', desc: 'CRM propio + bot WhatsApp para pedidos y dudas con pasarela de pago integrada.', result: 'Ventas y cobros automatizados', tag: 'CRM + Bot', active: false, img: '/projects/montchis.png', url: 'https://montchis.deliverectdirect.com/' },
  { name: 'App Comerciales', desc: 'SaaS propio de captacion e integracion de comerciales con CRM.', result: 'Equipo comercial gestionado en una app', tag: 'SaaS', active: false, img: '/projects/captacion.png', url: 'https://saas-factory-app-rho.vercel.app/' },
  { name: '1923 Barber Shop', desc: 'App de reservas y gestion de citas para barberia premium.', result: 'Cero llamadas para reservar', tag: 'App', active: false, img: '/projects/barbershop.png', url: 'https://booksy-2-0-chi.vercel.app/' },
  { name: 'Otis Valen', desc: 'Portafolio brutalista para estudio de diseño grafico y direccion creativa.', result: 'Presencia digital que impacta', tag: 'Web', active: false, img: '/projects/otisvalen.png', url: 'https://proyecto-brutalista.vercel.app/' },
]

const STATS = [
  { value: '6+', label: 'Clientes Activos' },
  { value: '24/7', label: 'Disponibilidad' },
  { value: '20+', label: 'Proyectos en Marcha' },
]

// ─── Hooks ───────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    document.querySelectorAll('[data-reveal], [data-reveal-stagger]')
      .forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}

function useSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.innerWidth < 1024) return

    const handler = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty('--mouse-x', `${e.clientX}px`)
        spotlightRef.current.style.setProperty('--mouse-y', `${e.clientY}px`)
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`
      }
    }

    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return { spotlightRef, dotRef }
}

function useCardIlluminate() {
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--card-mouse-x', `${x}px`)
    card.style.setProperty('--card-mouse-y', `${y}px`)
  }, [])

  return { onMouseMove: handleMouseMove }
}

// ─── Main Component ──────────────────────────────────

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [loaderExiting, setLoaderExiting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const handleChatOpen = useCallback(() => setChatOpen(true), [])
  const handleChatClose = useCallback(() => setChatOpen(false), [])

  const { spotlightRef, dotRef } = useSpotlight()
  const { onMouseMove: onCardMouseMove } = useCardIlluminate()
  useScrollReveal()

  // Force scroll to top on mount
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  // Loader
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 12 + 4
        return next >= 100 ? 100 : next
      })
    }, 80)

    const exitTimer = setTimeout(() => {
      setLoaderExiting(true)
      clearInterval(interval)
      setProgress(100)
    }, 2200)

    const hideTimer = setTimeout(() => {
      setLoading(false)
      setMounted(true)
      window.scrollTo(0, 0)
    }, 2800)

    return () => {
      clearInterval(interval)
      clearTimeout(exitTimer)
      clearTimeout(hideTimer)
    }
  }, [])


  return (
    <>
      {/* LOADER */}
      {loading && (
        <div className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center ${loaderExiting ? 'loader-exit' : ''}`}>
          {/* Logo completo con glow */}
          <div className="relative mb-6 animate-[fadeIn_0.8s_ease-out]">
            <Image src="/logo-profimaxia-full.png" alt="ProfimaxIA" width={280} height={187} className="relative z-10" priority />
            <div className="absolute inset-0 bg-[#3B82F6]/10 blur-[60px] rounded-full scale-75 animate-pulseGlow" />
          </div>

          {/* Tagline con fade-in escalonado */}
          <p className="text-sm sm:text-base text-white/30 tracking-[0.15em] uppercase mb-8 animate-[fadeIn_1s_ease-out_0.4s_both]" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
            Construimos el futuro de tu negocio
          </p>

          {/* Barra de progreso */}
          <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#93c5fd] transition-all duration-200 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-white/20 tracking-widest tabular-nums">
            {Math.round(Math.min(progress, 100))}%
          </p>
        </div>
      )}

      {/* CURSOR SPOTLIGHT (desktop) */}
      <div ref={spotlightRef} className="cursor-spotlight hidden lg:block" />
      <div ref={dotRef} className="cursor-dot hidden lg:block" />

      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[15%] w-[600px] h-[600px] bg-[#3B82F6]/[0.06] rounded-full blur-[150px] animate-breathe" />
        <div className="absolute bottom-[15%] right-[10%] w-[500px] h-[500px] bg-[#3B82F6]/[0.04] rounded-full blur-[130px] animate-breathe" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[60%] left-[60%] w-[400px] h-[400px] bg-[#3B82F6]/[0.03] rounded-full blur-[100px] animate-breathe" style={{ animationDelay: '5s' }} />
      </div>

      {/* MAIN CONTENT */}
      <main className="relative z-10">

        {/* ═══ NAV ═══ */}
        <nav className={`fixed top-0 left-0 right-0 z-40 px-6 lg:px-12 xl:px-20 py-5 flex items-center justify-between border-b border-white/[0.07] bg-[#06060e]/80 backdrop-blur-md transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2.5">
            <Image src="/logo-profimaxia-v2.png" alt="ProfimaxIA" width={32} height={32} className="object-contain" />
            <span className="text-sm font-bold text-white tracking-tight leading-none" style={{ fontFamily: 'var(--font-clash), system-ui' }}>PROFIMAXIA</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#problema" className="text-[13px] text-white/40 hover:text-white transition-colors uppercase tracking-wider">El problema</a>
            <a href="#servicios" className="text-[13px] text-white/40 hover:text-white transition-colors uppercase tracking-wider">Servicios</a>
            <a href="#proyectos" className="text-[13px] text-white/40 hover:text-white transition-colors uppercase tracking-wider">Proyectos</a>
            <a href="#nosotros" className="text-[13px] text-white/40 hover:text-white transition-colors uppercase tracking-wider">Nosotros</a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full border border-white/20 text-white text-[13px] font-medium hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-wider"
            >
              Hablemos
            </a>
          </div>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[35] md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="absolute top-[73px] left-0 right-0 bg-[#06060e]/95 backdrop-blur-xl border-b border-white/[0.07] p-6 flex flex-col gap-5 animate-[fadeIn_0.2s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              <a href="#problema" onClick={() => setMobileMenuOpen(false)} className="text-sm text-white/50 hover:text-white transition-colors uppercase tracking-wider">El problema</a>
              <a href="#servicios" onClick={() => setMobileMenuOpen(false)} className="text-sm text-white/50 hover:text-white transition-colors uppercase tracking-wider">Servicios</a>
              <a href="#proyectos" onClick={() => setMobileMenuOpen(false)} className="text-sm text-white/50 hover:text-white transition-colors uppercase tracking-wider">Proyectos</a>
              <a href="#nosotros" onClick={() => setMobileMenuOpen(false)} className="text-sm text-white/50 hover:text-white transition-colors uppercase tracking-wider">Nosotros</a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-wider"
              >
                Hablemos
              </a>
            </div>
          </div>
        )}

        {/* ═══ CHAPTER 1: HERO — El Gancho ═══ */}
        <section className="min-h-screen flex flex-col justify-between px-6 lg:px-12 xl:px-20 pt-20 pb-12 relative overflow-hidden">
          {/* Dust particles */}
          <div className="absolute bottom-0 left-0 right-0 h-[45vh] pointer-events-none z-0 overflow-hidden">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="dust-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 12}s`,
                  animationDuration: `${5 + Math.random() * 7}s`,
                  '--particle-size': `${1 + Math.random() * 2.5}px`,
                  '--particle-drift': `${(Math.random() - 0.5) * 60}px`,
                  '--particle-brightness': `${0.5 + Math.random() * 0.5}`,
                } as React.CSSProperties}
              />
            ))}
          </div>
          <div className={`flex items-center gap-8 lg:gap-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {/* Left: Text */}
            <div className="flex-1 relative z-10">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5.5rem] font-bold leading-[0.95] tracking-tighter mb-8" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
                <span className="text-white">Tu idea merece</span>
                <br />
                <span className="text-outline">un negocio que</span>
                <br />
                <span className="text-white">nunca deje de</span>
                <br />
                <span className="text-electric">vender.</span>
              </h1>

              <p className="text-lg sm:text-xl text-white/40 leading-snug max-w-xl mb-14 mt-6 tracking-tight" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
                Construimos software con IA que{' '}
                <span className="text-white/80">atiende</span>,{' '}
                <span className="text-white/80">vende</span> y{' '}
                <span className="text-white/80">trabaja por ti</span>.
                <br />
                <span className="text-[#3B82F6]/70">24 horas. 7 dias. Sin parar.</span>
              </p>

              <div className={`flex flex-col gap-12 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex gap-6 sm:gap-8 md:gap-12">
                  {STATS.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
                        {stat.value}
                      </div>
                      <div className="text-[10px] sm:text-xs text-white/25 mt-1 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pl-0 sm:pl-10">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#3B82F6]/30 text-[#93c5fd] text-sm font-medium hover:border-[#3B82F6]/70 hover:text-white hover:bg-[#3B82F6]/10 hover:shadow-[0_0_25px_rgba(59,130,246,0.3),0_0_60px_rgba(59,130,246,0.1)] transition-all duration-300"
                  >
                    Cuentame tu idea
                    <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                  </a>
                  <a
                    href="#proyectos"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#3B82F6]/30 text-[#93c5fd] text-sm font-medium hover:border-[#3B82F6]/70 hover:text-white hover:bg-[#3B82F6]/10 hover:shadow-[0_0_25px_rgba(59,130,246,0.3),0_0_60px_rgba(59,130,246,0.1)] transition-all duration-300"
                  >
                    Ver trabajo
                    <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Orbital 3D */}
            <div className="hidden lg:flex items-center justify-center flex-shrink-0 relative z-0 -mt-32">
              <div className="orbital-container">
                <div className="orbital-glow" />
                <div className="orbital-ring orbital-ring-1" />
                <div className="orbital-ring orbital-ring-2" />
                <div className="orbital-ring orbital-ring-3" />
                <div className="orbital-ring orbital-ring-4" />
                <div className="orbital-core" />
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className={`flex justify-center sm:justify-end transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button
              onClick={handleChatOpen}
              className="group inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-base sm:text-lg font-bold tracking-tight transition-all duration-300 hover:scale-105"
              style={{
                fontFamily: 'var(--font-clash), system-ui',
                background: '#93c5fd',
                color: '#06060e',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.25)'
                e.currentTarget.style.background = '#bfdbfe'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.15)'
                e.currentTarget.style.background = '#93c5fd'
              }}
            >
              Pruebame
              <ArrowDown className="w-5 h-5 -rotate-90 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        <div className="h-12 lg:h-20" />

        {/* ═══ CHAPTER 2: EL PROBLEMA — El Dolor ═══ */}
        <section id="problema" className="relative min-h-screen flex flex-col justify-center max-w-5xl mx-auto px-6 lg:px-12 py-20 overflow-hidden">
          {/* Background glow — red tint for pain */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[600px] bg-red-500/[0.04] rounded-full blur-[180px]" />
            <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-[#3B82F6]/[0.03] rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10">
            <div data-reveal className="text-center mb-20">
              <p className="text-[11px] uppercase tracking-[0.25em] text-red-400/70 mb-4 font-medium">La realidad</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
                Mientras lees esto, alguien esta
                <br />
                <span className="text-outline">intentando contactar tu negocio.</span>
              </h2>
              <p className="text-xl sm:text-2xl text-red-400/70 mt-8 font-bold tracking-tight" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
                Nadie responde.
              </p>
              <p className="text-sm text-white/25 mt-3 max-w-md mx-auto">Y cada dia sin un sistema que trabaje por ti, es dinero que se pierde.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8" data-reveal-stagger>
              {PAIN_POINTS.map((pain) => (
                <div key={pain.stat} className="glass-panel rounded-xl p-8 text-center group hover:border-red-400/40 hover:shadow-[0_0_40px_rgba(248,113,113,0.25),0_0_80px_rgba(248,113,113,0.12),inset_0_0_30px_rgba(248,113,113,0.06)] hover:bg-red-400/[0.06] transition-all duration-300 cursor-default">
                  <div className="w-10 h-10 rounded-full bg-red-400/10 border border-red-400/20 group-hover:bg-red-400/25 group-hover:border-red-400/50 group-hover:shadow-[0_0_20px_rgba(248,113,113,0.5),0_0_40px_rgba(248,113,113,0.2)] flex items-center justify-center mx-auto mb-5 transition-all duration-300">
                    <pain.icon className="w-4.5 h-4.5 text-red-400/70 group-hover:text-red-300 group-hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.8)] transition-all duration-300" />
                  </div>
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
                    {pain.stat}
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed mb-2">
                    {pain.text}
                  </p>
                  <p className="text-xs text-white/20 italic">
                    {pain.subtext}
                  </p>
                </div>
              ))}
            </div>

            {/* Transition: pain → solution */}
            <div data-reveal className="mt-20 flex flex-col items-center gap-4">
              <div className="w-px h-16 bg-gradient-to-b from-red-400/20 to-[#3B82F6]/40" />
              <p className="text-2xl sm:text-3xl lg:text-4xl text-electric font-bold tracking-tight" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
                No tiene por que ser asi.
              </p>
              <div className="w-px h-16 bg-gradient-to-b from-[#3B82F6]/40 to-transparent" />
            </div>
          </div>
        </section>

        {/* ═══ CHAPTER 3: SERVICIOS — La Solucion ═══ */}
        <section id="servicios" className="min-h-screen flex flex-col justify-center max-w-6xl mx-auto px-6 lg:px-12 py-20">
          <div data-reveal className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#3B82F6]/70 mb-3 font-medium">La solucion</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
              Esto es lo que construimos para ti
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-end">
            {/* Left: Solutions — card viñetas */}
            <div className="flex-1 flex flex-col gap-4" data-reveal-stagger>
              {SOLUTIONS.map((s) => (
                <div
                  key={s.title}
                  onMouseMove={onCardMouseMove}
                  className="card-illuminate glass-panel rounded-2xl p-6 group cursor-default transition-all duration-300 hover:border-[#3B82F6]/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.35),0_0_80px_rgba(59,130,246,0.15),inset_0_0_30px_rgba(59,130,246,0.06)] hover:bg-[#3B82F6]/[0.05]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/[0.08] border border-[#3B82F6]/15 flex items-center justify-center group-hover:bg-[#3B82F6]/20 group-hover:border-[#3B82F6]/40 group-hover:shadow-[0_0_18px_rgba(59,130,246,0.5),0_0_35px_rgba(59,130,246,0.2)] transition-all duration-300">
                      <s.icon className="w-4.5 h-4.5 text-[#3B82F6]/70 group-hover:text-[#93c5fd] group-hover:drop-shadow-[0_0_8px_rgba(147,197,253,0.8)] transition-all duration-300" />
                    </div>
                    <h4 className="text-base font-bold text-white/80 group-hover:text-white tracking-tight transition-colors duration-300" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
                      {s.title}
                    </h4>
                  </div>
                  <p className="text-sm text-white/30 leading-relaxed group-hover:text-white/50 transition-colors duration-300">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Right: Bot visual + Chat */}
            <div data-reveal="right" className="w-full lg:w-[440px] flex-shrink-0">
              <div className="flex flex-col items-center relative">
                {/* Orbits — behind everything */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] h-[280px] z-0">
                  {/* Outer dashed orbit */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-white/[0.07] animate-[spin_30s_linear_infinite]">
                    {/* Grey planet with own orbit ring */}
                    <div className="absolute top-4 left-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6b7280] to-[#374151] shadow-[0_0_8px_rgba(107,114,128,0.3)]" />
                      <div className="absolute inset-[-6px] rounded-full border border-dashed border-[#3B82F6]/20" />
                    </div>
                  </div>
                  {/* Inner orbit */}
                  <div className="absolute inset-10 rounded-full border border-white/[0.04] animate-[spin_22s_linear_infinite_reverse]">
                    <div className="absolute bottom-0 right-4 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#c2410c] shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  </div>
                  {/* Ambient glow */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-40 rounded-full bg-[#3B82F6]/[0.05] blur-3xl" />
                  </div>
                </div>

                {/* Bot — above orbits, below chat */}
                <div className="relative z-[5] flex flex-col items-center mb-0">
                  {/* Antenna */}
                  <div className="relative mb-[-2px]">
                    <div className="w-[2px] h-5 bg-gradient-to-t from-[#52525b] to-[#a1a1aa] rounded-full mx-auto" />
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#d97706] shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
                    {/* Orange ball — offset right like reference */}
                    <div className="absolute -top-3 left-[18px] w-4 h-4 rounded-full bg-gradient-to-br from-[#f97316] to-[#c2410c] shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                  </div>

                  {/* Head */}
                  <div className="relative">
                    {/* Gold ear pieces */}
                    <div className="absolute -left-2.5 top-3 w-2.5 h-6 rounded-l-lg bg-gradient-to-b from-[#d4a017] to-[#92710a] shadow-[0_0_6px_rgba(212,160,23,0.3)]" />
                    <div className="absolute -right-2.5 top-3 w-2.5 h-6 rounded-r-lg bg-gradient-to-b from-[#d4a017] to-[#92710a] shadow-[0_0_6px_rgba(212,160,23,0.3)]" />

                    {/* Main head body */}
                    <div className="w-[100px] h-[76px] rounded-2xl bg-gradient-to-b from-[#3f3f46] to-[#27272a] border border-[#52525b]/60 flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
                      {/* Eye visor */}
                      <div className="w-[76px] h-[40px] rounded-xl bg-gradient-to-b from-[#1c1917] to-[#0c0a09] border border-[#3f3f46]/40 flex items-center justify-center gap-4 shadow-[inset_0_3px_12px_rgba(0,0,0,0.6)]">
                        {/* Eyes */}
                        <div className="w-[17px] h-[17px] rounded-full bg-gradient-to-br from-[#fef08a] to-[#f59e0b] shadow-[0_0_14px_rgba(250,204,21,0.9),0_0_35px_rgba(245,158,11,0.4)]" />
                        <div className="w-[17px] h-[17px] rounded-full bg-gradient-to-br from-[#fef08a] to-[#f59e0b] shadow-[0_0_14px_rgba(250,204,21,0.9),0_0_35px_rgba(245,158,11,0.4)]" />
                      </div>
                    </div>
                  </div>

                  {/* Neck */}
                  <div className="w-12 h-3 bg-gradient-to-b from-[#27272a] to-transparent rounded-b-lg" />
                </div>

                {/* Chat panel — flush with bot neck */}
                <div className="w-full glass-panel rounded-2xl overflow-hidden flex flex-col border-[#3B82F6]/20 relative z-10 mt-[-2px]" style={{ height: '460px' }}>
                  {/* Blue glow cloud — large and vivid */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-32 bg-[#3B82F6]/20 rounded-full blur-3xl pointer-events-none z-20" />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-52 h-20 bg-[#3B82F6]/30 rounded-full blur-2xl pointer-events-none z-20" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-10 bg-[#60A5FA]/25 rounded-full blur-xl pointer-events-none z-20" />
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#93c5fd]/20 rounded-full blur-md pointer-events-none z-20" />
                  {/* Top glow line */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#3B82F6]/60 to-transparent" />

                  {/* Spacer so chat content starts below the glow */}
                  <div className="h-10 flex-shrink-0" />
                  <div className="flex-1 min-h-0">
                    <ChatWidget />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ═══ CHAPTER 4: COMO FUNCIONA — El Proceso ═══ */}
        <section className="min-h-screen flex flex-col justify-center max-w-5xl mx-auto px-6 lg:px-12 py-20">
          <div data-reveal className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#3B82F6]/70 mb-3 font-medium">El proceso</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
              Asi de simple
            </h2>
          </div>

          <div className="relative" data-reveal-stagger>
            {/* Horizontal connecting line (desktop) */}
            <div className="absolute top-[60px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#3B82F6]/25 to-transparent hidden lg:block" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {PROCESS_STEPS.map((step) => (
                <div
                  key={step.num}
                  onMouseMove={onCardMouseMove}
                  className="card-illuminate glass-panel rounded-2xl p-8 group cursor-default text-center transition-all duration-300 hover:border-[#3B82F6]/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.3),0_0_80px_rgba(59,130,246,0.12),inset_0_0_30px_rgba(59,130,246,0.05)] hover:bg-[#3B82F6]/[0.04]"
                >
                  {/* Number — outline style */}
                  <div className="text-5xl lg:text-6xl font-bold text-outline mb-5 group-hover:[-webkit-text-stroke-color:rgba(59,130,246,0.6)] transition-all duration-300" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
                    {step.num}
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-white mb-3 tracking-tight group-hover:text-[#93c5fd] transition-colors duration-300" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/35 leading-relaxed group-hover:text-white/50 transition-colors duration-300">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div data-reveal className="mt-14 text-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full border border-[#3B82F6]/30 text-[#93c5fd] text-sm font-bold hover:border-[#3B82F6]/60 hover:text-white hover:bg-[#3B82F6]/10 hover:shadow-[0_0_30px_rgba(59,130,246,0.3),0_0_60px_rgba(59,130,246,0.1)] transition-all duration-300"
              style={{ fontFamily: 'var(--font-clash), system-ui' }}
            >
              Empieza por el paso 1
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* ═══ CHAPTER 5: PROYECTOS — La Prueba ═══ */}
        <section id="proyectos" className="min-h-screen flex flex-col justify-center max-w-5xl mx-auto px-6 lg:px-12 py-20">
          <div data-reveal className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#3B82F6]/70 mb-3 font-medium">La prueba</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
              Ya lo hicimos para ellos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-reveal-stagger>
            {PROJECTS.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl overflow-hidden border border-white/[0.06] transition-all duration-500 hover:border-[#3B82F6]/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.3),0_0_80px_rgba(59,130,246,0.12)] hover:scale-[1.02]"
              >
                {/* Background image or fallback */}
                {p.img ? (
                  <img
                    src={p.img}
                    alt={p.name}
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] to-[#111133]" />
                )}
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.2) 70%, transparent 100%)' }} />

                {/* Content */}
                <div className="relative z-[2] p-5 flex flex-col justify-end h-[220px]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-[#93c5fd] transition-colors duration-300" style={{ fontFamily: 'var(--font-clash), system-ui' }}>{p.name}</h4>
                    {p.active && (
                      <span className="flex items-center gap-1.5 text-[9px] text-[#3B82F6] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed mb-3 group-hover:text-white/70 transition-colors duration-300">{p.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-black/50 text-[#3B82F6]/80 border border-[#3B82F6]/20 backdrop-blur-sm group-hover:bg-[#3B82F6]/20 group-hover:text-[#93c5fd] group-hover:border-[#3B82F6]/40 transition-all duration-300">{p.tag}</span>
                    <span className="text-[10px] text-white/40 italic group-hover:text-[#93c5fd]/80 transition-colors duration-300">{p.result}</span>
                  </div>
                </div>

                {/* Hover arrow */}
                <div className="absolute top-3 right-3 z-[2] w-7 h-7 rounded-full bg-black/30 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                  <ArrowRight className="w-3 h-3 text-white/70" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ═══ CHAPTER 6: NUESTRA HISTORIA — La Confianza ═══ */}
        <div className="section-alt">
          <section id="nosotros" className="min-h-screen flex flex-col justify-center max-w-5xl mx-auto px-6 lg:px-12 py-20">
            <div data-reveal className="text-center mb-16">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#3B82F6]/70 mb-3 font-medium">Nuestra historia</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
                No somos una agencia.<br />
                <span className="text-outline">Somos builders.</span>
              </h2>
            </div>

            {/* Timeline */}
            <div className="relative max-w-2xl mx-auto">
              {/* Vertical line */}
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#3B82F6]/20 to-transparent" />

              {[
                { icon: Rocket, title: 'Un tio con una obsesion', text: 'Hace un año, David — graduado en ADE, programador autodidacta y con un Master en Ciencia de Datos — tenia una certeza: habia demasiada gente con ideas brillantes que no podia construirlas. No por falta de talento, sino porque nadie apostaba por ellos. Asi que dejo de esperar y empezo a construir el mismo.' },
                { icon: Code, title: 'Madrugones, cafe y codigo', text: 'Los primeros meses fueron pura obsesion. Aprender cada dia algo nuevo, romper cosas, arreglarlas y volver a empezar. Cada proyecto era un reto personal: demostrar que un autodidacta con hambre podia entregar resultados que otros cobraban diez veces mas. Y funciono.' },
                { icon: Heart, title: 'De proyecto personal a equipo real', text: 'Lo que nacio como una aventura en solitario es hoy un equipo de personas que comparten la misma filosofia: construir software que funciona de verdad. Un año despues, varios negocios ya venden, atienden y escalan gracias a lo que construimos juntos.' },
              ].map((step, i) => (
                <div key={i} data-reveal={i % 2 === 0 ? 'left' : 'right'} className="relative flex items-start gap-5 mb-10 last:mb-0">
                  <div className="relative z-10 w-9 h-9 rounded-full bg-[#06060e] border border-[#3B82F6]/30 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-4 h-4 text-[#3B82F6]" />
                  </div>
                  <div className="pt-1">
                    <h3 className="text-base font-bold text-white mb-1.5" style={{ fontFamily: 'var(--font-clash), system-ui' }}>{step.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div data-reveal="scale" className="mt-14 relative max-w-2xl mx-auto text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-5xl text-[#3B82F6]/20 font-serif">&ldquo;</div>
              <p className="text-lg text-white/50 italic leading-relaxed pt-4">
                No esperes a tener todo listo para empezar. Empieza y el camino te enseña lo que necesitas.
              </p>
              <p className="text-xs text-[#3B82F6]/60 mt-4 font-medium">David &mdash; Fundador</p>
            </div>
          </section>
        </div>

        {/* ═══ CHAPTER 7: CTA FINAL — El Cierre ═══ */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 lg:px-12 py-20 relative">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[500px] rounded-full bg-[#3B82F6]/[0.04] blur-[120px]" />
          </div>

          <div data-reveal="scale" className="relative z-10 text-center max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#3B82F6]/70 mb-6 font-medium">Da el paso</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 leading-[1.1]" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
              Tu competencia ya
            </h2>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1]" style={{ fontFamily: 'var(--font-clash), system-ui' }}>
              <span className="text-electric">esta automatizando.</span>
            </h2>
            <p className="text-base text-white/40 mb-3 max-w-md mx-auto leading-relaxed">
              Cuentanos tu idea. 30 minutos, sin compromiso. Te decimos exactamente como la hacemos realidad.
            </p>
            <p className="text-xs text-white/20 mb-10">
              Cada dia sin actuar es un cliente que se va a otro.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleChatOpen}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#3B82F6] text-white text-sm font-bold hover:bg-[#60A5FA] hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all duration-300 hover:scale-105"
              >
                Habla con Axia ahora
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full border border-white/15 text-white/60 text-sm font-medium hover:bg-white hover:text-black transition-all duration-300"
              >
                Contactanos
              </a>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-white/[0.06] pt-14 pb-8 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-12">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <Image src="/logo-profimaxia-v2.png" alt="ProfimaxIA" width={24} height={24} />
                  <span className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-clash), system-ui' }}>ProfimaxIA</span>
                </div>
                <p className="text-xs text-white/30 max-w-xs leading-relaxed mb-3">
                  Convertimos ideas en software que vende, atiende y escala solo.
                </p>
                <a href="mailto:davidmadrazo@profimaxia.com" className="text-xs text-white/30 hover:text-[#3B82F6] transition-colors duration-300">
                  davidmadrazo@profimaxia.com
                </a>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#25D366] hover:border-[#25D366]/40 hover:shadow-[0_0_20px_rgba(37,211,102,0.15)] transition-all duration-300"
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                </a>
                <a
                  href="https://www.instagram.com/davidmadrazo.ia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#E4405F] hover:border-[#E4405F]/40 hover:shadow-[0_0_20px_rgba(228,64,95,0.15)] transition-all duration-300"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </a>
                <a
                  href="https://www.tiktok.com/@davidmadrazo_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300"
                  aria-label="TikTok"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48 6.3 6.3 0 001.86-4.49V8.74a8.26 8.26 0 004.85 1.56V6.84a4.84 4.84 0 01-1.13-.15z" /></svg>
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-white/20 text-center sm:text-left">&copy; {new Date().getFullYear()} ProfimaxIA. Todos los derechos reservados.</span>
              <span className="text-[11px] text-white/20 text-center sm:text-right">David Madrazo Martínez &middot; NIF 72353794A</span>
            </div>
          </div>
        </footer>
      </main>

      {/* ═══ CHAT OVERLAY ═══ */}
      {chatOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm">
          <div className="flex items-center justify-center h-[100dvh] p-0 sm:p-8">
            <div className="animate-chatOverlayIn w-full sm:max-w-lg h-full sm:max-h-[700px] flex flex-col glass-panel-strong sm:rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <Image src="/axia-avatar.png" alt="Axia" width={28} height={28} className="rounded-full object-cover" />
                  <div>
                    <span className="text-sm font-semibold text-white">Axia</span>
                    <span className="text-[10px] text-[#3B82F6] ml-2">Online</span>
                  </div>
                </div>
                <button
                  onClick={handleChatClose}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 min-h-0">
                <ChatWidget />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
