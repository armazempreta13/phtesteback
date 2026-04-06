
import React, { useEffect, useRef } from 'react';
import { useMobile } from '../hooks/useMobile';

// --- CLASSES OTIMIZADAS PARA NOTEBOOKS E MOBILE ---

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  targetAlpha: number;

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2 + 0.5;
    this.alpha = 0;
    this.targetAlpha = Math.random() * 0.6 + 0.2;
  }

  update(w: number, h: number, mouse: { x: number, y: number }) {
    if (this.alpha < this.targetAlpha) this.alpha += 0.01;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) { this.x = 0; this.vx *= -1; }
    if (this.x > w) { this.x = w; this.vx *= -1; }
    if (this.y < 0) { this.y = 0; this.vy *= -1; }
    if (this.y > h) { this.y = h; this.vy *= -1; }

    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    // Otimização: Distância de interação reduzida
    const mouseDistSq = 10000; // 100 * 100

    if (dx * dx + dy * dy < mouseDistSq) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            const force = (100 - dist) / 100;
            const forceX = (dx / dist) * force * 1.5;
            const forceY = (dy / dist) * force * 1.5;
            this.x -= forceX;
            this.y -= forceY;
        }
    }
  }

  draw(ctx: CanvasRenderingContext2D, theme: 'light' | 'dark') {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = theme === 'dark' ? '#a78bfa' : '#7c3aed';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Aurora {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  // Otimização: Cache do gradiente para evitar recriação a cada frame
  gradient: CanvasGradient | null = null;

  constructor(w: number, h: number, color: string) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.radius = Math.random() * 300 + 200;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 0.2;
    this.vy = (Math.random() - 0.5) * 0.2;
  }

  update(w: number, h: number) {
    this.x += this.vx;
    this.y += this.vy;
    
    if (this.x < -200 || this.x > w + 200) this.vx *= -1;
    if (this.y < -200 || this.y > h + 200) this.vy *= -1;
    
    // Otimização: NÃO invalidamos o gradiente a cada frame. 
    // Só precisaríamos invalidar se a cor ou raio mudassem dinamicamente.
    // Como a posição é usada no createRadialGradient, precisamos recriar APENAS o draw,
    // mas o objeto Aurora em si não precisa de logica pesada.
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!isFinite(this.x) || !isFinite(this.y)) return;

    try {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    } catch (e) {
        // Fallback silencioso
    }
  }
}

class SpatialGrid {
  cellSize: number;
  grid: Map<string, Particle[]>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  clear() {
    this.grid.clear();
  }

  insert(particle: Particle) {
    const cellX = Math.floor(particle.x / this.cellSize);
    const cellY = Math.floor(particle.y / this.cellSize);
    const key = `${cellX},${cellY}`;
    
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(particle);
  }

  getNearby(particle: Particle): Particle[] {
    const cellX = Math.floor(particle.x / this.cellSize);
    const cellY = Math.floor(particle.y / this.cellSize);
    const nearby: Particle[] = [];

    for (let x = cellX - 1; x <= cellX + 1; x++) {
      for (let y = cellY - 1; y <= cellY + 1; y++) {
        const key = `${x},${y}`;
        const cell = this.grid.get(key);
        if (cell) {
          nearby.push(...cell);
        }
      }
    }

    return nearby;
  }
}

interface InteractiveBackgroundProps {
    theme?: 'light' | 'dark';
}

export const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({ theme = 'light' }) => {
  const isMobile = useMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const particlesRef = useRef<Particle[]>([]);
  const aurorasRef = useRef<Aurora[]>([]);
  const spatialGridRef = useRef<SpatialGrid>(new SpatialGrid(150));
  
  const sizeRef = useRef({ w: 0, h: 0 });
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    // Otimização Crítica: Se for mobile, não executa o canvas para economizar bateria
    if (isMobile) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true }); // Alpha habilitado
    if (!ctx) return;

    let animationFrameId: number;
    let lastMouseUpdate = 0;
    let lastFrameTime = 0;

    // Distância de conexão reduzida para evitar desenho excessivo de linhas em telas congestionadas
    const CONNECTION_DIST_SQ = 15000; // ~122px
    const MOUSE_THROTTLE = 24; // Aumentado throttle para 24ms (aprox 40fps de mouse update)

    const drawGrid = (w: number, h: number) => {
      const gridSize = 50; // Grade maior = menos linhas para desenhar
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(124, 58, 237, 0.02)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      for (let x = 0; x <= w; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    };

    const initObjects = (w: number, h: number) => {
        if (particlesRef.current.length > 0) return;

        // Otimização: Redução drástica de partículas em telas menores (notebooks)
        let maxParticles = 60;
        if (w < 1400) maxParticles = 35; // Notebooks
        if (w < 1000) maxParticles = 20; // Tablets

        // Divisor maior = menos partículas
        const divisor = w < 1400 ? 20000 : 12000;
        const particleCount = Math.min(Math.floor((w * h) / divisor), maxParticles);
        
        for (let i = 0; i < particleCount; i++) {
            particlesRef.current.push(new Particle(w, h));
        }
        
        // Menos auroras em telas pequenas
        const auroraCount = w < 1400 ? 2 : 3;

        if (theme === 'light') {
            aurorasRef.current.push(new Aurora(w, h, 'rgba(124, 58, 237, 0.12)'));
            aurorasRef.current.push(new Aurora(w, h, 'rgba(59, 130, 246, 0.08)'));
            if (auroraCount > 2) aurorasRef.current.push(new Aurora(w, h, 'rgba(16, 185, 129, 0.04)'));
        } else {
            aurorasRef.current.push(new Aurora(w, h, 'rgba(124, 58, 237, 0.06)'));
            aurorasRef.current.push(new Aurora(w, h, 'rgba(59, 130, 246, 0.04)'));
        }
    };

    const render = (currentTime: number = 0) => {
        // Limita a 40 FPS em telas menores/laptops para evitar aquecimento
        const targetFPS = window.innerWidth < 1400 ? 40 : 60;
        const interval = 1000 / targetFPS;
        const deltaTime = currentTime - lastFrameTime;
        
        if (deltaTime < interval) {
            animationFrameId = requestAnimationFrame(render);
            return;
        }
        
        lastFrameTime = currentTime - (deltaTime % interval);
        const { w, h } = sizeRef.current;
        
        if (w <= 0 || h <= 0) {
             animationFrameId = requestAnimationFrame(render);
             return;
        }

        if (theme === 'light') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
        } else {
            ctx.clearRect(0, 0, w, h);
        }
        
        // Grid opcional em telas maiores para poupar GPU
        if (w > 1000) drawGrid(w, h);

        ctx.save();

        const auroras = aurorasRef.current;
        for (let i = 0; i < auroras.length; i++) {
            auroras[i].update(w, h);
            auroras[i].draw(ctx);
        }

        const particles = particlesRef.current;
        const mouse = mouseRef.current;
        const spatialGrid = spatialGridRef.current;
        
        spatialGrid.clear();
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update(w, h, mouse);
            spatialGrid.insert(particles[i]);
        }

        for (let i = 0; i < particles.length; i++) {
            particles[i].draw(ctx, theme);
        }
        
        ctx.strokeStyle = theme === 'dark' ? 'rgba(167, 139, 250, 0.12)' : 'rgba(124, 58, 237, 0.12)';
        ctx.lineWidth = 1;

        const processed = new Set<string>();
        
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            const nearby = spatialGrid.getNearby(p1);
            
            // Limitando conexões para evitar complexidade O(n^2) visual
            let connections = 0;
            
            for (let j = 0; j < nearby.length; j++) {
                if (connections > 3) break; // Otimização: Máximo 3 conexões por partícula

                const p2 = nearby[j];
                if (p1 === p2) continue;
                
                const key1 = `${i}-${particles.indexOf(p2)}`;
                const key2 = `${particles.indexOf(p2)}-${i}`;
                if (processed.has(key1) || processed.has(key2)) continue;
                processed.add(key1);
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;
                
                if (distSq < CONNECTION_DIST_SQ) {
                    const dist = Math.sqrt(distSq);
                    ctx.beginPath();
                    ctx.globalAlpha = (1 - dist / 122) * 0.3; // Opacidade reduzida
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                    connections++;
                }
            }
        }
        
        ctx.restore();
        animationFrameId = requestAnimationFrame(render);
    };

    const updateSize = () => {
        if (!container || !canvas) return;
        
        const rect = container.getBoundingClientRect();
        // Em telas de alta densidade, limitar DPR a 1.5 para performance
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        
        if (Math.abs(rect.width - sizeRef.current.w) < 50 && Math.abs(rect.height - sizeRef.current.h) < 50) {
            return;
        }
        
        sizeRef.current = { w: rect.width, h: rect.height };
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        // Reset se redimensionar muito
        particlesRef.current = [];
        aurorasRef.current = [];
        initObjects(rect.width, rect.height);
    };

    const resizeObserver = new ResizeObserver(() => {
        // Debounce resize
        setTimeout(updateSize, 100);
    });
    resizeObserver.observe(container);

    const handleMouseMove = (e: MouseEvent) => {
        const now = performance.now();
        if (now - lastMouseUpdate < MOUSE_THROTTLE) return;
        lastMouseUpdate = now;
        
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    updateSize();
    render();

    return () => {
        resizeObserver.disconnect();
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, theme]);

  if (isMobile) {
      return (
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
               <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-transparent' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}></div>
               <div className={`absolute top-0 right-0 w-[200px] h-[200px] rounded-full blur-[60px] ${theme === 'dark' ? 'bg-primary-500/10' : 'bg-primary-200/20'}`}></div>
               <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: theme === 'dark' ? 'radial-gradient(#ffffff 1px, transparent 1px)' : 'radial-gradient(#7c3aed 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          </div>
      );
  }

  return (
    <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden" 
        style={{ zIndex: 0 }}
    >
        <canvas 
            ref={canvasRef} 
            className="block w-full h-full"
            style={{ width: '100%', height: '100%' }}
        />
    </div>
  );
};
