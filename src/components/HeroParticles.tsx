import { useEffect, useRef } from 'react'
import styles from './HeroParticles.module.css'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const mouse = { x: -9999, y: -9999 }

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const count = isMobile ? 30 : 68
    const maxDist = 130
    const mouseRadius = 120
    const mouseForce = 3.5

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 1.5 + 0.8,
    }))

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        mouse.x = e.clientX - rect.left
        mouse.y = e.clientY - rect.top
      } else {
        mouse.x = -9999
        mouse.y = -9999
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < mouseRadius && dist > 0) {
          const force = ((mouseRadius - dist) / mouseRadius) * mouseForce
          p.vx += (dx / dist) * force * 0.06
          p.vy += (dy / dist) * force * 0.06
        }

        p.vx *= 0.985
        p.vy *= 0.985

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 2) {
          p.vx = (p.vx / speed) * 2
          p.vy = (p.vy / speed) * 2
        }
        if (speed < 0.06) {
          p.vx += (Math.random() - 0.5) * 0.12
          p.vy += (Math.random() - 0.5) * 0.12
        }

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) }
        if (p.x > canvas.width) { p.x = canvas.width; p.vx = -Math.abs(p.vx) }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy = -Math.abs(p.vy) }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.3
            ctx.beginPath()
            ctx.strokeStyle = `rgba(11, 158, 142, ${alpha})`
            ctx.lineWidth = 0.7
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(212, 175, 55, 0.6)'
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
