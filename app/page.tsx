'use client'; // DIRECTIVA OBLIGATORIA PARA NEXT.JS APP ROUTER

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Menu, X, ArrowRight, TrendingUp, Activity, Target, ShieldCheck, ChevronDown,
  MessageCircle, CheckCircle2, Search, Compass, Rocket, Lock, Clock, FileText,
  Users, BarChart3, Briefcase, LineChart, FileCheck, MousePointer2
} from 'lucide-react';
import { useForm } from 'react-hook-form';

// --- FIREBASE CONFIGURATION ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Lógica robusta para detectar configuración: 
const getFirebaseConfig = () => {
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
    try {
      return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
    } catch (e) {
      console.error("Error parsing env config");
      return {};
    }
  }
  // Parche para evitar error de TypeScript con variables globales
  const globalVars = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  const fallbackConfig = globalVars.__firebase_config;
  if (fallbackConfig) return JSON.parse(fallbackConfig);

  // Fallback final: Credenciales de Santiago (Bravence)
  return {
    apiKey: "AIzaSyCbMOEED3yNtX0nn-9hgQJzGUkTdbap0rg",
    authDomain: "bravence-d3bbe.firebaseapp.com",
    projectId: "bravence-d3bbe",
    storageBucket: "bravence-d3bbe.firebasestorage.app",
    messagingSenderId: "305314105144",
    appId: "1:305314105144:web:000797b81456e767b823cd",
    measurementId: "G-L5S4T4XN1C"
  };
};

const firebaseConfig = getFirebaseConfig();

// Detect application ID for Firestore paths (must match CRM)
const getAppId = () => {
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_APP_ID) {
    return process.env.NEXT_PUBLIC_APP_ID;
  }
  const globalVars = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  return globalVars.__app_id || 'bravence-app';
};

const appId = getAppId();

let auth: any, db: any;
try {
  if (firebaseConfig && Object.keys(firebaseConfig).length > 0 && firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("🔥 Firebase initialized successfully.");
  } else {
    console.warn("⚠️ Firebase config missing. Running in simulation mode.");
  }
} catch (e) {
  console.error("❌ Firebase init error:", e);
}

// --- COMPONENTS ---

const Button = ({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false }: any) => {
  const baseStyle = "relative overflow-hidden px-8 py-4 font-bold tracking-[-0.02em] transition-all duration-300 ease-out flex items-center justify-center gap-2 group rounded-lg";

  const variants: any = {
    primary: `bg-gradient-to-r from-[#4daea1] to-[#2a8f83] text-white shadow-lg shadow-[#4daea1]/30 hover:shadow-xl hover:shadow-[#4daea1]/40 hover:-translate-y-0.5`,
    outline: `border border-[#4daea1] text-[#0a594f] hover:bg-[#4daea1]/10 backdrop-blur-sm`,
    dark: `bg-gradient-to-r from-[#0a594f] to-[#063c35] text-white shadow-lg shadow-[#0a594f]/30 hover:shadow-xl hover:shadow-[#0a594f]/40 hover:-translate-y-0.5`,
  };

  return (
    <button
      type={type === 'submit' ? 'submit' : 'button'}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
    </button>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const container = document.getElementById('scroll-container');
    const handleScroll = () => setScrolled((container?.scrollTop ?? 0) > 20);
    container?.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for Navbar Active State
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.3, root: container });

    document.querySelectorAll('section[id]').forEach((section) => observer.observe(section));

    return () => {
      container?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (href: string) => {
    setIsOpen(false);
    const container = document.getElementById('scroll-container');
    const element = document.querySelector(href);
    if (container && element) {
      if (href === '#hero') {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const top = (element as HTMLElement).offsetTop;
        container.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  const navLinks = [
    { name: 'Inicio', href: '#hero' },
    { name: 'Nosotros', href: '#about' },
    { name: 'Servicios', href: '#services' },
    { name: 'Método', href: '#process' },
    { name: 'Contacto', href: '#contact' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a1614]/90 backdrop-blur-md border-b border-white/5 py-4 shadow-2xl' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }} className="z-50 group">
            <h1 className={`text-2xl font-bold tracking-[-0.062em] transition-colors duration-300 ${scrolled || isOpen ? 'text-[#0a594f]' : 'text-white'}`}>
              Bravence<span className="text-[#4daea1] group-hover:animate-pulse">.</span>
            </h1>
          </a>

          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className={`text-sm font-medium tracking-wide transition-all relative
                    ${isActive ? 'text-[#4daea1]' : (scrolled ? 'text-white/90 hover:text-[#4daea1]' : 'text-white/90 hover:text-[#c6fff7]')}
                    after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:bg-[#4daea1] after:transition-all
                    ${isActive ? 'after:w-full font-bold' : 'after:w-0 hover:after:w-full'}
                  `}
                >
                  {link.name}
                </button>
              );
            })}
            <Button variant={scrolled ? 'primary' : 'primary'} className="!py-2.5 !px-6 text-sm !rounded-full" onClick={() => scrollToSection('#contact')}>
              Agendar Diagnóstico
            </Button>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden z-50 focus:outline-none p-2 rounded-full hover:bg-white/10 transition-colors">
            {isOpen ? <X className="text-[#0a594f]" /> : <Menu className={scrolled ? 'text-[#c6fff7]' : 'text-white'} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full sm:w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-40 flex flex-col pt-28 px-8 border-l border-gray-100"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link, i) => {
                const isActive = activeSection === link.href.substring(1);
                return (
                  <motion.button
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => scrollToSection(link.href)}
                    className={`text-3xl font-bold tracking-[-0.04em] text-left transition-colors flex items-center justify-between ${isActive ? 'text-[#4daea1]' : 'text-[#0a594f] hover:text-[#4daea1]'}`}
                  >
                    {link.name}
                    {isActive && <div className="w-2 h-2 rounded-full bg-[#4daea1]" />}
                  </motion.button>
                );
              })}
              <div className="pt-8 border-t border-gray-100">
                <Button variant="dark" className="w-full !rounded-xl" onClick={() => scrollToSection('#contact')}>
                  Agendar Diagnóstico
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- REFACTORED HERO SECTION (COMPACT VERSION) ---
const Hero = () => {
  return (
    <section id="hero" className="relative flex flex-col justify-center pt-24 pb-16 md:pt-40 md:pb-28 overflow-hidden bg-[#0a594f] min-h-[100svh]">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-90">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover pointer-events-none"
        >
          <source src="/AZukPXaE7IJQHYe8nTsMwg-AZukPXaEbXl-tmVwTX0EyA.webm" type="video/webm" />
        </video>
      </div>
      {/* Darker overlay for better text contrast */}
      <div className="absolute inset-0 bg-[#061e1b]/80 mix-blend-multiply"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#061e1b]/60 via-transparent to-[#061e1b]"></div>

      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#4daea1]/20 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4 pointer-events-none mix-blend-screen"
      />
      <div className="absolute inset-0 opacity-[0.15] mix-blend-soft-light" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")' }}></div>

      <div className="container mx-auto px-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-3 py-1.5 px-4 bg-white/[0.03] backdrop-blur-xl rounded-full border border-white/10 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] mb-5 group cursor-default" 
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4daea1] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4daea1]"></span>
            </span>
            <span className="text-gray-300 group-hover:text-white transition-colors text-[10px] font-bold tracking-widest uppercase">
              Consultoría Estratégica
            </span>
          </motion.div>

          <h1 className="text-[10vw] sm:text-[8vw] md:text-[8vw] lg:text-[7.5vw] font-black text-white tracking-[-0.05em] leading-[0.95] drop-shadow-2xl mb-4 md:mb-8 max-w-none">
            El socio estratégico que <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ffffff] via-[#c6fff7] to-[#4daea1]">
              tu empresa necesita
            </span><br />
            para escalar seguro.
          </h1>

          <p className="text-sm md:text-lg lg:text-xl text-gray-300 mb-6 md:mb-8 max-w-xl leading-relaxed font-light border-l border-white/20 pl-4">
            Ordenamos tus números, optimizamos tus operaciones y convertimos tus ventas en rentabilidad real. <span className="text-white font-medium">Sin fórmulas mágicas, con trabajo profesional.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-5">
            <div className="relative group/btn cursor-pointer w-full sm:w-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#4daea1] to-[#0a594f] rounded-full blur opacity-40 group-hover/btn:opacity-75 transition duration-500"></div>
              <Button
                variant="primary"
                className="relative !rounded-full !px-8 md:!px-10 !py-3.5 md:!py-5 text-sm md:text-lg w-full sm:w-auto overflow-hidden group bg-gradient-to-r from-[#0a594f] to-[#0d7a6e] hover:from-[#0d7a6e] hover:to-[#4daea1] border border-white/10 shadow-xl"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Agendar Diagnóstico Gratuito <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
            <Button
              variant="outline"
              className="!text-white !border-white/30 hover:!bg-white/10 !rounded-full !px-8 md:!px-10 !py-3.5 md:!py-5 w-full sm:w-auto text-sm md:text-base"
              onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver cómo trabajamos
            </Button>
          </div>
        </motion.div>
      </div>

      {/* UX: Animated Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity z-20"
        onClick={() => {
          const aboutSection = document.getElementById('about');
          if (aboutSection) {
            const y = aboutSection.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }}
      >
        <span className="text-white/60 text-xs tracking-widest uppercase font-semibold">Deslizá</span>
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center p-1">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-2 bg-[#4daea1] rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-12 md:py-16 lg:py-20 bg-[#06100e] relative overflow-hidden flex flex-col justify-center min-h-[100svh]">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="container mx-auto px-5 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* TEXT — FIRST on mobile, left on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-1"
          >
            <h3 className="text-[#4daea1] font-bold tracking-widest uppercase text-sm mb-3 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#4daea1]"></span> Sobre Nosotros
            </h3>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-8 leading-tight max-w-xl">
              Visión técnica. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0a594f] to-[#4daea1]">
                Sentido común y los pies en la tierra.
              </span>
            </h2>
            <div className="space-y-4 text-gray-300 text-base leading-relaxed font-light max-w-2xl">
              <p>
                Sabemos lo que cuesta levantar una persiana todos los días en Argentina. Gestionar tu negocio <strong className="text-white font-medium">"a ojo" o solo por intuición</strong> se vuelve peligroso en un contexto que cambia constantemente.
              </p>
              <p>
                <strong className="text-[#c6fff7] font-bold">Bravence</strong> nació para ser <span className="text-[#4daea1] font-semibold">tu socio técnico</span>; ese que se sienta a tu lado con datos reales. Te damos la <strong className="text-white font-medium">claridad absoluta que necesitás</strong> para tomar decisiones seguras y volver a dormir tranquilo.
              </p>
            </div>
            <div className="mt-6 relative group/quote">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#4daea1]/30 to-[#0a594f]/30 rounded-2xl blur opacity-0 group-hover/quote:opacity-100 transition duration-700"></div>
              <div className="relative p-5 bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-[#4daea1]/30 rounded-2xl transition-all duration-300">
                <p className="text-[#c6fff7] font-medium italic text-sm md:text-base leading-relaxed relative z-10">
                  &quot;No te vendemos manuales teóricos ni motivación vacía. Construimos sistemas a medida para que tu negocio sea rentable, predecible y no dependa de que estés apagando incendios 24/7.&quot;
                </p>
              </div>
            </div>
          </motion.div>

          {/* VIDEO — SECOND on mobile, right on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative group block order-1 md:order-2"
          >
            <div className="absolute inset-0 bg-[#0a594f] rounded-3xl transform rotate-3 transition-transform group-hover:rotate-6 duration-500 opacity-10" />
            <div className="absolute inset-0 bg-[#4daea1] rounded-3xl transform -rotate-3 transition-transform group-hover:-rotate-6 duration-500 opacity-10" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#0a594f]/5 aspect-[4/3] group-hover:scale-105 transition-transform duration-1000 ease-out">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                className="w-full h-full object-cover absolute inset-0 pointer-events-none"
              >
                <source src="/pantallabravence.webm" type="video/webm" />
              </video>
              <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 bg-white/95 backdrop-blur shadow-lg p-4 md:p-6 rounded-xl md:rounded-2xl max-w-[160px] border border-gray-100 z-10">
                <p className="text-3xl md:text-4xl font-bold text-[#0a594f] mb-1">100%</p>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">Enfoque en Resultados Medibles</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};


//  AMBIENT PARTICLE CANVAS HOOK
//  Particles float peacefully at all times.
//  On slide change: hyperspace-jump in slide direction.
// =============================================
const useAmbientParticles = (canvasRef: { current: HTMLCanvasElement | null }) => {
  const jumpRef = useRef({ dir: 0 as number, intensity: 0 as number });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const COLORS = ['#4daea1', '#70d4c8', '#c6fff7', '#2a8f83', '#ffffff', '#0d7a6e'];
    const COUNT = 120;

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 0.8 + Math.random() * 2.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.2 + Math.random() * 0.5,
    }));

    const ctx = canvas.getContext('2d')!;
    let frame = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { dir, intensity } = jumpRef.current;

      // Dampen jump over time
      if (jumpRef.current.intensity > 0) {
        jumpRef.current.intensity = Math.max(0, jumpRef.current.intensity - 0.04);
      }

      for (const p of particles) {
        // SPHERE BOOST: Particles map to a 3D sphere rotating horizontally
        // Continuous wrap direction
        const horizontalVelocity = dir * intensity * 16;
        
        p.x += p.vx + horizontalVelocity;
        
        // Add a slight vertical curve based on horizontal position to simulate a sphere's surface
        const distFromCenter = (p.x - canvas.width / 2) / (canvas.width / 2);
        const sphereCurveY = Math.abs(distFromCenter) * intensity * 4;
        p.y += p.vy - sphereCurveY; // Curve up at the edges

        // Wrap around edges continuously
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        ctx.save();
        ctx.globalAlpha = p.alpha * (0.4 + intensity * 0.6);
        ctx.fillStyle = p.color;
        ctx.beginPath();

        // Horizontal/Curved streaks during jump
        if (intensity > 0.1) {
          const stretch = 1 + intensity * 15;
          // Angle tilts slightly based on sphere position curve
          const angle = Math.atan2(-sphereCurveY, horizontalVelocity);
          ctx.ellipse(p.x, p.y, p.r * stretch, p.r * 0.6, angle, 0, Math.PI * 2);
        } else {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        }

        ctx.fill();
        ctx.restore();
      }
    };

    animate();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);

  const jump = (dir: number) => {
    jumpRef.current = { dir, intensity: 1 };
  };

  return { jump };
};

// =============================================
//  SERVICES SECTION — Horizontal 3D Wheel
// =============================================
const Services = () => {
  const pillars = [
    { 
      id: 1, 
      title: "Nuestros servicios de Estrategia Comercial y Marketing", 
      icon: <Target className="w-7 h-7" />, 
      bg: "from-cyan-400 to-cyan-600", 
      desc: "Sabemos que invertir en publicidad y no ver resultados genera mucha frustración. Te ayudamos a medir qué canales traccionan realmente, para que cada peso que inviertas atraiga a los clientes correctos y vuelva a tu negocio.",
      items: ["Análisis de rentabilidad por canal", "Optimización de proceso comercial", "Estrategias de retención de clientes", "Integración de herramientas simples (CRM)"] 
    },
    { 
      id: 2, 
      title: "Nuestros servicios de Ingeniería Financiera y Pricing", 
      icon: <Activity className="w-7 h-7" />, 
      bg: "from-teal-400 to-teal-600", 
      desc: "Nos sentamos a revisar tus costos reales y te ayudamos a definir precios que te protejan de los cambios económicos. Queremos que vender más signifique realmente ganar más.",
      items: ["Punto de equilibrio real", "Armado de costos de reposición", "Saneamiento del flujo de caja", "Proyecciones financieras"] 
    },
    { 
      id: 3, 
      title: "Nuestros servicios de Optimización Operativa", 
      icon: <TrendingUp className="w-7 h-7" />, 
      bg: "from-emerald-500 to-emerald-700", 
      desc: "Si sentís que sos indispensable y pasás el día resolviendo urgencias, te acompañamos para ordenar el día a día. El objetivo es que tu equipo trabaje con mayor autonomía, permitiéndote recuperar tu tiempo.",
      items: ["Detección de costos ocultos", "Mejora en compras y proveedores", "Documentación de tareas diarias", "Reducción de fricciones operativas"] 
    },
    { 
      id: 4, 
      title: "Nuestros servicios de Inteligencia de Datos y Gobierno Corporativo", 
      icon: <ShieldCheck className="w-7 h-7" />, 
      bg: "from-teal-600 to-teal-900", 
      desc: "El olfato que te trajo hasta acá es valioso, pero para crecer sano hace falta claridad. Armamos tableros simples para ver la salud de tu empresa en una pantalla y ordenamos tu estructura familiar y financiera.",
      items: ["Tableros visuales y simples (KPIs)", "Profesionalización para empresas familiares", "Separación caja personal/empresarial", "Organización societaria"] 
    },
  ];

  const [active, setActive] = useState(pillars.length - 1);
  const [direction, setDirection] = useState(1);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.4 });
  const canvasRef = useRef(null as unknown as HTMLCanvasElement);
  const { jump } = useAmbientParticles(canvasRef);
  const dragStartX = useRef(null as null | number);
  const dragStartY = useRef(null as null | number);
  const isHorizontalSwipe = useRef(false);
  const isAnimating = useRef(false);

  // Determine direction but force continuous wrap logic
  // Swiping left = negative diff = next card
  // dir=1 means animation flows left-to-right on screen, dir=-1 means right-to-left
  const goTo = (idx: number, fromUser = false) => {
    if (isAnimating.current || idx === active) return;
    
    if (fromUser) {
      setIsAutoPlay(false);
      setShowSwipeHint(false);
    }
    
    // Continuous loop check:
    let diff = idx - active;
    if (diff > pillars.length / 2) diff -= pillars.length;
    if (diff < -pillars.length / 2) diff += pillars.length;
    
    // Set flow direction negatively (next = moves left)
    const dir = diff > 0 ? -1 : 1; 
    setDirection(dir);
    setActive(idx);
    jump(dir);
    
    isAnimating.current = true;
    setTimeout(() => { isAnimating.current = false; }, 600);
  };
  const next = () => goTo((active + 1) % pillars.length, true);
  const prev = () => goTo((active - 1 + pillars.length) % pillars.length, true);

  // Auto-advance Services cards every 15 seconds para dar más tiempo de lectura
  useEffect(() => {
    if (!isAutoPlay || !isInView) return;
    const timer = setInterval(() => {
      goTo((active + 1) % pillars.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [active, isAutoPlay, isInView]);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="py-8 md:py-16 lg:py-20 bg-[#0a1614] relative overflow-hidden min-h-[100svh] flex flex-col justify-center"
      onMouseDown={(e) => { 
        dragStartX.current = e.clientX; 
      }}
      onMouseUp={(e) => {
        if (dragStartX.current !== null) {
          const d = e.clientX - dragStartX.current;
          if (Math.abs(d) > 30) setShowSwipeHint(false);
          if (d < -40) next(); else if (d > 40) prev();
          dragStartX.current = null;
        }
      }}
      onTouchStart={(e) => { 
        dragStartX.current = e.touches[0].clientX;
        dragStartY.current = e.touches[0].clientY;
        isHorizontalSwipe.current = false;
      }}
      onTouchMove={(e) => {
        if (dragStartX.current === null || dragStartY.current === null) return;
        const dx = Math.abs(e.touches[0].clientX - dragStartX.current);
        const dy = Math.abs(e.touches[0].clientY - dragStartY.current);
        // If horizontal movement is dominant, lock vertical scroll
        if (dx > 10 && dx > dy * 1.2) {
          isHorizontalSwipe.current = true;
          e.preventDefault();
        }
      }}
      onTouchEnd={(e) => {
        if (dragStartX.current !== null) {
          const d = e.changedTouches[0].clientX - dragStartX.current;
          if (Math.abs(d) > 30) setShowSwipeHint(false);
          if (d < -30) next(); else if (d > 30) prev();
          dragStartX.current = null;
          dragStartY.current = null;
          isHorizontalSwipe.current = false;
        }
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,#0a594f25_0%,transparent_70%)] pointer-events-none" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Swipe Hint */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-3 text-[#4daea1] text-xs font-bold uppercase tracking-[0.3em] mb-12 md:hidden"
        >
          <span className="w-4 h-px bg-[#4daea1]/30" />
          Nuestros Servicios - Deslizá
          <span className="w-4 h-px bg-[#4daea1]/30" />
        </motion.div>

        <div className="relative max-w-2xl mx-auto select-none">
          {/* Swipe UI Overlay Hint (Hand Animation) — only on mobile & until first interaction */}
          <AnimatePresence>
            {showSwipeHint && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none md:hidden"
              >
                <motion.div 
                  initial={{ x: -20 }}
                  animate={{ x: 20 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 1.2,
                    ease: "easeInOut"
                  }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-full p-6 border border-white/20 shadow-2xl relative">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="absolute inset-0 bg-[#4daea1]/20 rounded-full blur-xl"
                    />
                    <MousePointer2 className="w-10 h-10 text-white rotate-[15deg] drop-shadow-lg" />
                    
                    {/* Floating Arrows */}
                    <motion.div className="absolute -left-12 top-1/2 -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-white/40 rotate-180" />
                    </motion.div>
                    <motion.div className="absolute -right-12 top-1/2 -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-white/40" />
                    </motion.div>
                  </div>
                  <span className="text-white text-[10px] font-bold tracking-[0.4em] uppercase bg-[#0a1614]/80 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                    Deslizá para ver más
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Perspective wrapper for 3D Globe Equator effect */}
          <div style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}>
            <div className="relative overflow-hidden" style={{ minHeight: '360px' }}>
              {pillars.map((pillar, idx) => {
                // Cálculo de distancia circular para efecto 3D infinito
                let diff = (idx - active) % pillars.length;
                if (diff < -pillars.length / 2) diff += pillars.length;
                if (diff > pillars.length / 2) diff -= pillars.length;

                // Solo renderizamos las 3 tarjetas más cercanas para optimizar rendimiento (centro, izquierda, derecha)
                if (Math.abs(diff) > 1) return null;

                const isCenter = diff === 0;
                const isLeft = diff === -1;
                const isRight = diff === 1;

                // Propiedades de animación basadas en la posición relativa
                const currentScale = isCenter ? 1 : 0.8;
                const currentOpacity = isCenter ? 1 : 0.3;
                const currentX = isCenter ? '0%' : isLeft ? '-72%' : '72%';
                const currentZ = isCenter ? 0 : -200;
                const currentRotateY = isCenter ? 0 : isLeft ? 35 : -35;
                const zIndex = isCenter ? 30 : 10;

                return (
                  <motion.div
                    key={pillar.id}
                    animate={{
                      x: currentX,
                      z: currentZ,
                      rotateY: currentRotateY,
                      scale: currentScale,
                      opacity: currentOpacity,
                    }}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }} 
                    style={{ 
                      width: '100%', 
                      transformStyle: 'preserve-3d',
                      position: isCenter ? 'relative' : 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: zIndex,
                      pointerEvents: isCenter ? 'auto' : 'none'
                    }}
                  >
                    <div
                      className="bg-gradient-to-br from-[#0f2e2a] to-[#061a17] rounded-3xl border border-[#4daea1]/20 shadow-2xl p-5 md:p-8 relative overflow-hidden"
                      style={{ backdropFilter: 'blur(12px)' }}
                    >
                      <div className={`absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br ${pillar.bg} opacity-[0.13] rounded-full blur-3xl pointer-events-none`} />

                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.bg} flex items-center justify-center text-white shadow-xl flex-shrink-0`}>
                          {pillar.icon}
                        </div>
                        <div>
                          <span className="text-[#4daea1] text-[9px] font-bold tracking-widest uppercase">Pilar {String(idx + 1).padStart(2, '0')} / 04</span>
                          <h3 className="text-lg md:text-2xl font-bold text-white leading-tight">{pillar.title}</h3>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm leading-relaxed mb-6">
                        {pillar.desc}
                      </p>

                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {pillar.items.map((item, j) => (
                          <li
                            key={item}
                            className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-4 py-2.5 border border-white/[0.07] hover:border-[#4daea1]/30 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4daea1] flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mt-8">
            <button onClick={prev} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-[#4daea1]/20 hover:border-[#4daea1]/40 flex items-center justify-center text-white transition-all active:scale-90">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="flex gap-2 items-center">
              {pillars.map((_, i) => (
                <button key={i} onClick={() => goTo(i, true)} className={`transition-all duration-300 rounded-full ${i === active ? 'w-8 h-2.5 bg-[#4daea1]' : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'}`} />
              ))}
            </div>
            <button onClick={next} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-[#4daea1]/20 hover:border-[#4daea1]/40 flex items-center justify-center text-white transition-all active:scale-90">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};


// =============================================
//  PROCESS SECTION — Step Carousel
// =============================================
const Process = () => {
  const steps = [
    { id: "01", phase: "Inmersión", title: "Diagnóstico", desc: "Nos metemos de lleno en los números y procesos de tu negocio para entender dónde estamos parados. Identificamos juntos dónde se está escapando el dinero, qué procesos están trabados y cuáles son las oportunidades de mejora inmediata.", deliverable: "Diagnóstico de Salud Financiera y Operativa", icon: <FileCheck className="w-8 h-8 md:w-10 md:h-10" />, color: "from-blue-400 to-blue-600", accent: "#3b82f6" },
    { id: "02", phase: "Diseño Estratégico", title: "Planificación y diseño de estrategia", desc: "Con el diagnóstico sobre la mesa, armamos un plan de acción claro. Definimos prioridades para mejorar tu rentabilidad y tu organización en los próximos meses, asignando recursos de forma inteligente y sin prometer cosas imposibles.", deliverable: "Plan de Acción (RoadMap) a 90 días", icon: <Compass className="w-8 h-8 md:w-10 md:h-10" />, color: "from-emerald-400 to-emerald-600", accent: "#10b981" },
    { id: "03", phase: "Acción y Control", title: "Implementación y control", desc: "No te dejamos un PDF lindo y nos vamos. Te acompañamos en la implementación diaria. Instalamos tableros de control muy simples de leer para que puedas medir los avances, corregir desvíos a tiempo y ver resultados reales en tu cuenta bancaria.", deliverable: "Tableros de Control (KPIs) y Soporte Continuo", icon: <LineChart className="w-8 h-8 md:w-10 md:h-10" />, color: "from-[#4daea1] to-[#0a594f]", accent: "#4daea1" },
  ];

  const [active, setActive] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.4 });

  // Auto-advance timeline — resets every time 'active' changes
  useEffect(() => {
    if (!isAutoPlay || !isInView) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, 12000); // changes every 12 seconds
    return () => clearInterval(timer);
  }, [active, steps.length, isAutoPlay, isInView]);

  return (
    <section id="process" ref={sectionRef} className="py-12 md:py-16 lg:py-20 bg-white relative overflow-hidden flex flex-col justify-center min-h-[100svh]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-6 md:mb-10 max-w-4xl mx-auto">
          <span className="inline-block text-[#0a594f] font-bold tracking-widest uppercase text-xs mb-3 bg-[#4daea1]/10 px-4 py-1.5 rounded-full border border-[#4daea1]/20">Nuestro Método</span>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 md:mb-4">Un proceso claro, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0a594f] to-[#4daea1]">sin cajas negras.</span></h2>
          <p className="hidden md:block text-gray-600 text-base md:text-lg leading-relaxed">No imponemos recetas armadas. Entendemos tu negocio, diseñamos un plan realista y te acompañamos a implementarlo paso a paso.</p>
        </div>


        <div className="relative max-w-6xl mx-auto">
          {/* Desktop: 2-col grid timeline */}
          <div className="hidden md:grid md:grid-cols-12 gap-8 md:gap-16 items-center min-h-[400px]">
          
          {/* Left Column: Interactive Timeline Map */}
          <div className="col-span-4 md:col-span-5 relative">
            <div className="absolute left-[15px] md:left-[23px] top-0 bottom-0 w-px bg-gray-200" />
            
            <div className="space-y-4 md:space-y-8">
              {steps.map((step, index) => {
                const isActive = active === index;
                return (
                  <button 
                    key={step.id} 
                    onClick={() => {
                      setActive(index);
                      setIsAutoPlay(false);
                    }}
                    className="relative flex items-center gap-3 md:gap-8 w-full group text-left transition-all duration-300"
                  >
                    {/* Glowing Dot */}
                    <div className="relative flex-shrink-0 flex items-center justify-center">
                      <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full border-2 transition-all duration-500 flex items-center justify-center z-10 ${isActive ? 'bg-white border-[#4daea1] text-[#0a594f] shadow-[0_0_20px_rgba(77,174,161,0.3)]' : 'bg-gray-50 border-gray-200 text-gray-400 group-hover:border-[#4daea1]/40'}`}>
                        <span className="font-bold text-xs md:text-sm tracking-wider">{step.id}</span>
                      </div>
                      {/* Active line filler */}
                      {isActive && index !== steps.length - 1 && (
                         <motion.div 
                           layoutId="activeLine"
                           className="absolute top-8 md:top-12 left-1/2 -ml-[1px] w-[2px] h-16 md:h-24 bg-gradient-to-b from-[#4daea1] to-transparent z-0 origin-top"
                           initial={{ scaleY: 0 }}
                           animate={{ scaleY: 1 }}
                           transition={{ duration: 0.5 }}
                         />
                      )}
                    </div>

                    {/* Timeline Text */}
                    <div className="flex-1">
                      <h4 className={`text-sm sm:text-base md:text-xl font-bold transition-colors duration-300 leading-tight ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
                        {step.title}
                      </h4>
                      <p className={`text-[9px] md:text-sm uppercase tracking-widest font-bold mt-0.5 md:mt-1 transition-colors duration-300 ${isActive ? 'text-[#0a594f]' : 'text-gray-400'}`}>
                        {step.phase}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Content Viewer */}
          <div className="col-span-8 md:col-span-7 relative h-full flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
                className="relative bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md rounded-[2.5rem] p-6 md:p-10"
              >
                {/* Background glow accent */}
                <div className={`absolute inset-0 bg-gradient-to-br ${steps[active].color} opacity-[0.03] rounded-[2.5rem] pointer-events-none`} />

                <div className="relative z-10">
                  <div className={`w-12 h-12 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl flex items-center justify-center text-white mb-4 md:mb-8 bg-gradient-to-br ${steps[active].color}`}>
                    {steps[active].icon}
                  </div>
                  
                  <h3 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-6 leading-tight">
                    {steps[active].title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed text-xs md:text-base lg:text-lg mb-6 md:mb-10 font-light">
                    {steps[active].desc}
                  </p>

                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-[#0a594f]" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-1">Entregable Concreto</p>
                      <p className="text-base md:text-lg font-medium text-gray-900">{steps[active].deliverable}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          </div>{/* End hidden md:grid -- Desktop layout */}

          {/* Mobile: circular numbered timeline + card — same look as desktop */}
          <div className="md:hidden">
            <div className="relative mb-4">
              <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const isActive = active === index;
                  return (
                    <button
                      key={step.id}
                      onClick={() => {
                        setActive(index);
                        setIsAutoPlay(false);
                      }}
                      className="relative flex items-center gap-4 w-full group text-left transition-all duration-300"
                    >
                      <div className="relative flex-shrink-0 flex items-center justify-center">
                        <div className={`w-8 h-8 rounded-full border-2 transition-all duration-500 flex items-center justify-center z-10 ${
                          isActive ? 'bg-white border-[#4daea1] text-[#0a594f] shadow-[0_0_16px_rgba(77,174,161,0.3)]' : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}>
                          <span className="font-bold text-xs">{step.id}</span>
                        </div>
                        {isActive && index !== steps.length - 1 && (
                          <motion.div
                            layoutId="activeLine-mobile"
                            className="absolute top-8 left-1/2 -ml-[1px] w-[2px] h-10 bg-gradient-to-b from-[#4daea1] to-transparent z-0 origin-top"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.4 }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-bold leading-tight transition-colors ${
                          isActive ? 'text-gray-900' : 'text-gray-400'
                        }`}>{step.title}</h4>
                        <p className={`text-[9px] uppercase tracking-widest font-bold mt-0.5 transition-colors ${
                          isActive ? 'text-[#0a594f]' : 'text-gray-400'
                        }`}>{step.phase}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                className="relative bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.06)] rounded-2xl p-5"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${steps[active].color} opacity-[0.03] rounded-2xl pointer-events-none`} />
                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 bg-gradient-to-br ${steps[active].color}`}>
                    {steps[active].icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{steps[active].title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm mb-4">{steps[active].desc}</p>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-3.5 h-3.5 text-[#0a594f]" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-bold text-gray-500">Entregable</p>
                      <p className="text-xs font-semibold text-gray-900">{steps[active].deliverable}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};


const Contact = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        const globalWithAuth = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
        if (globalWithAuth.__initial_auth_token) {
          await signInWithCustomToken(auth, globalWithAuth.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) { console.error("Auth Init Error:", error); }
    };
    initAuth();
    return onAuthStateChanged(auth, (u: any) => setUser(u));
  }, []);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      if (auth && !auth.currentUser) {
        try { await signInAnonymously(auth); } catch (e) { console.log("Auto-login failed on submit"); }
      }

      if (db) {
        const currentUser = auth ? auth.currentUser : null;

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leads'), {
          ...data,
          createdAt: serverTimestamp(),
          status: 'new',
          source: 'web_form_prod',
          userId: currentUser ? currentUser.uid : 'anonymous'
        });
        console.log("✅ ÉXITO: Datos guardados en Firebase Firestore:", data);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("⚠️ SIMULACIÓN: Firebase no conectado.", data);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      reset();
    } catch (error) {
      console.error("Error técnico (Silent):", error);
      setIsSubmitting(false);
      setIsSuccess(true);
      reset();
    }
  };

  const inputClasses = "w-full bg-[#0a1614] border border-white/10 px-4 py-3.5 rounded-xl focus:outline-none focus:border-[#4daea1] focus:bg-[#06100e] focus:ring-4 focus:ring-[#4daea1]/20 transition-all duration-300 text-white placeholder-gray-500 text-sm font-medium shadow-inner";
  const labelClasses = "block text-sm font-bold text-gray-300 mb-2 tracking-wide";
  const errorClasses = "text-red-400 text-xs mt-1.5 ml-1 font-medium";

  return (
    <section id="contact" className="py-16 md:py-24 lg:py-32 bg-[#0a594f] relative overflow-hidden flex flex-col justify-center">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#114a42] to-transparent opacity-80"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#4daea1]/20 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="container mx-auto px-5 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-0 bg-white/[0.02] backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">

          {/* LEFT PANEL — shown FIRST on mobile for context before the form */}
          <div className="md:col-span-2 bg-[#06100e]/50 p-5 md:p-10 text-white flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4daea1]/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 md:mb-6 text-white leading-tight">Hablemos de tu <br /><span className="text-[#4daea1]">Negocio</span></h3>
              <p className="text-gray-400 mb-6 md:mb-10 leading-relaxed font-light text-sm md:text-base">
                Dar el primer paso para ordenar tu empresa no tiene costo. Agendá una sesión inicial de 30 minutos con uno de nuestros socios.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4 group cursor-default">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#4daea1] group-hover:bg-[#4daea1]/10 transition-colors duration-300">
                    <BarChart3 size={20} />
                  </div>
                  <div className="pt-1">
                    <h5 className="font-bold text-white text-sm">Diagnóstico Inicial</h5>
                    <p className="text-xs text-gray-500 mt-1">Análisis de tu sector y competencia.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group cursor-default">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#4daea1] group-hover:bg-[#4daea1]/10 transition-colors duration-300">
                    <Users size={20} />
                  </div>
                  <div className="pt-1">
                    <h5 className="font-bold text-white text-sm">Sesión 30 min</h5>
                    <p className="text-xs text-gray-500 mt-1">Descubrimiento con un socio.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#4daea1]/20 transition-colors">
                  <MessageCircle size={14} className="text-[#4daea1]" />
                </div>
                <span className="text-sm font-medium tracking-wide">bravencestudio@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 p-6 md:p-8 lg:p-10 bg-transparent relative z-10">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-4"
              >
                <div className="w-20 h-20 bg-[#4daea1]/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-[#4daea1]/5">
                  <CheckCircle2 className="w-10 h-10 text-[#4daea1]" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">¡Solicitud Recibida!</h3>
                <p className="text-gray-400 mb-8 max-w-sm leading-relaxed text-sm md:text-base">
                  Nuestro equipo de análisis evaluará tu perfil. Si encontramos sinergias claras, te contactaremos en breve.
                </p>
                <Button variant="primary" onClick={() => setIsSuccess(false)} className="!text-sm !py-3 !px-8">
                  Volver al formulario
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Tu nombre *</label>
                    <input {...register("name", { required: "Requerido" })} className={inputClasses} placeholder="Juan Pérez" />
                    {errors.name && <p className={errorClasses}>{errors.name.message?.toString()}</p>}
                  </div>
                  <div>
                    <label className={labelClasses}>Tu email empresarial *</label>
                    <input type="email" {...register("email", { required: "Requerido", pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } })} className={inputClasses} placeholder="juan@empresa.com" />
                    {errors.email && <p className={errorClasses}>{errors.email.message?.toString()}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Nombre de tu empresa *</label>
                    <input {...register("company", { required: "Requerido" })} className={inputClasses} placeholder="Mi Empresa S.A." />
                    {errors.company && <p className={errorClasses}>{errors.company.message?.toString()}</p>}
                  </div>
                  <div>
                    <label className={labelClasses}>Teléfono / WhatsApp *</label>
                    <input {...register("phone", { required: "Requerido" })} className={inputClasses} placeholder="+54 9 11 ..." />
                    {errors.phone && <p className={errorClasses}>{errors.phone.message?.toString()}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Tu rol en la empresa *</label>
                    <div className="relative">
                      <select {...register("role")} className={`${inputClasses} appearance-none cursor-pointer`} defaultValue="Dueño / Socio">
                        <option value="Dueño / Socio">Dueño / Socio</option>
                        <option value="Gerente General">Gerente General</option>
                        <option value="Director de Área">Director de Área</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses} title="Esto nos ayuda a entender tu escala y prepararnos mejor">
                      ¿En qué rango de facturación mensual se encuentra la empresa? *
                    </label>
                    <div className="relative">
                      <select {...register("revenue", { required: "Requerido" })} className={`${inputClasses} appearance-none cursor-pointer`} defaultValue="">
                        <option value="" disabled>Selecciona un rango...</option>
                        {/* CORREGIDO: Valores legibles */}
                        <option value="Menos de $10 Millones">Menos de $10 Millones</option>
                        <option value="Entre $10M y $50 Millones">Entre $10M y $50 Millones</option>
                        <option value="Entre $50M y $200 Millones">Entre $50M y $200 Millones</option>
                        <option value="Más de $200 Millones">Más de $200 Millones</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                    {errors.revenue && <p className={errorClasses}>Selecciona un rango de facturación</p>}
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>¿Qué es lo que más te quita el sueño hoy en tu negocio? *</label>
                  <div className="relative">
                    <select {...register("challenge", { required: "Requerido" })} className={`${inputClasses} appearance-none font-medium text-[#0a594f] cursor-pointer`} defaultValue="">
                      <option value="" disabled>Selecciona una opción...</option>
                      {/* CORREGIDO: Valores legibles */}
                      <option value="Rentabilidad y Costos">Rentabilidad y Costos</option>
                      <option value="Estrategia Comercial / Ventas">Estrategia Comercial / Ventas</option>
                      <option value="Eficiencia Operativa">Eficiencia Operativa</option>
                      <option value="Profesionalización / Gobierno">Profesionalización / Gobierno</option>
                      <option value="Otro">Otro</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                  {errors.challenge && <p className={errorClasses}>Selecciona un desafío</p>}
                </div>

                {submissionError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">{submissionError}</div>}

                <div className="pt-4 relative group/btn">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4daea1] to-[#0a594f] rounded-xl blur opacity-30 group-hover/btn:opacity-60 transition duration-500 mt-4"></div>
                  <Button type="submit" variant="primary" className="w-full relative !rounded-xl !py-4 bg-gradient-to-r from-[#0a594f] to-[#0d7a6e] hover:from-[#0d7a6e] hover:to-[#4daea1] border border-white/10 shadow-xl overflow-hidden" disabled={isSubmitting}>
                    <span className="relative z-10 font-bold tracking-wide">
                      {isSubmitting ? 'Procesando solicitud...' : 'Solicitar mi Sesión de Diagnóstico'}
                    </span>
                  </Button>
                </div>

                <div className="flex justify-center pt-3 text-xs text-gray-400 px-2 text-center">
                  <span>Garantizamos total confidencialidad sobre tu información. Respondemos en menos de 24hs.</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Sticky CTA bar for mobile — always visible, max conversion
const StickyMobileCTA = () => (
  <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-4 pb-4 pt-2 bg-gradient-to-t from-[#050d0b]/95 to-transparent backdrop-blur-sm">
    <button
      onClick={() => {
        const scrollContainer = document.getElementById('scroll-container');
        const contactSection = document.getElementById('contact');
        if (scrollContainer && contactSection) {
          const top = contactSection.offsetTop;
          scrollContainer.scrollTo({ top, behavior: 'smooth' });
        }
      }}
      className="w-full bg-gradient-to-r from-[#4daea1] to-[#0a594f] text-white font-bold py-4 px-6 rounded-2xl shadow-2xl shadow-[#4daea1]/30 flex items-center justify-center gap-2 text-sm tracking-wide active:scale-95 transition-transform"
    >
      Agendar Diagnóstico Gratuito <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

const Footer = () => (
  <footer className="bg-[#050d0b] pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
    <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold tracking-[-0.062em] mb-2 text-white">Bravence.</h2>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Bravence Consulting. Todos los derechos reservados.</p>
      </div>
      <div className="flex gap-8">
        <a href="#" className="text-gray-400 hover:text-[#4daea1] transition-colors text-sm">LinkedIn</a>
        <a href="#" className="text-gray-400 hover:text-[#4daea1] transition-colors text-sm">Privacidad</a>
      </div>
    </div>
  </footer>
);

const FloatingWhatsApp = () => (
  <a href="https://wa.me/+5493518163142" target="_blank" rel="noopener noreferrer" className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:shadow-green-500/30 hover:scale-110 transition-all duration-300 flex items-center justify-center" aria-label="Contactar por WhatsApp">
    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  </a>
);

// =============================================
// JavaScript-based Scroll Snap — ONLY between Hero and About
// All other module transitions are free scroll
// =============================================
const useScrollSnap = (containerId: string) => {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let isSnapping = false;

    const handleScrollEnd = () => {
      if (isSnapping) return;
      
      const hero = document.getElementById('hero');
      const about = document.getElementById('about');
      if (!hero || !about) return;

      const scrollTop = container.scrollTop;
      const viewportH = container.clientHeight;
      const threshold = viewportH * 0.15;
      const aboutTop = about.offsetTop;

      // Solo actuamos en la zona entre Hero y About
      // Si el scroll está lejos de esta frontera, no hacemos nada
      const distanceToAbout = Math.abs(scrollTop - aboutTop);
      const distanceToHero = scrollTop; // Hero está en top=0

      if (distanceToAbout < threshold && distanceToAbout > 5) {
        // Cerca del borde de About → snap a About
        isSnapping = true;
        container.scrollTo({ top: aboutTop, behavior: 'smooth' });
        setTimeout(() => { isSnapping = false; }, 600);
      } else if (scrollTop > 0 && scrollTop < aboutTop && distanceToHero < threshold && distanceToHero > 5) {
        // Cerca del borde de Hero → snap a Hero
        isSnapping = true;
        container.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => { isSnapping = false; }, 600);
      }
    };

    const handleScroll = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(handleScrollEnd, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (timer) clearTimeout(timer);
    };
  }, [containerId]);
};

const App = () => {
  useScrollSnap('scroll-container');
  return (
    <main className="font-sans antialiased bg-gray-50 selection:bg-[#4daea1] selection:text-white overflow-x-hidden w-full relative pb-[72px] md:pb-0">
      <Navbar />
      {/* Snap container — only these sections "lock" into place */}
      <div id="scroll-container" className="h-screen overflow-y-auto" style={{ scrollBehavior: 'auto' }}>
        <Hero />
        <About />
        <Services />
        <Process />
        {/* Contact & Footer flow freely at the end */}
        <Contact />
        <Footer />
      </div>
      <FloatingWhatsApp />
      <StickyMobileCTA />
    </main>
  );
};

export default App;