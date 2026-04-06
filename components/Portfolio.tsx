
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Eye, Layers, ArrowRight } from 'lucide-react';
import { SectionTitle } from './SectionTitle';
import { Project, ViewType } from '../types';
import { ProjectModal } from './ProjectModal';
import { SEO } from './SEO';
import { OptimizedImage } from './OptimizedImage';
import { useContent } from '../contexts/ContentContext';

interface PortfolioProps {
  onOpenChat: () => void;
  onNavigate: (view: ViewType) => void;
}

const ProjectCard: React.FC<{ 
    project: Project; 
    index: number; 
    onClick: () => void;
    className?: string;
}> = ({ project, index, onClick, className = "" }) => {
    const isInternalDemo = project.demoUrl.startsWith('#internal:');

    return (
        <motion.div
            layoutId={`project-${project.id}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            onClick={onClick}
            className={`group relative overflow-hidden rounded-[2rem] cursor-pointer bg-gray-900 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500 ${className}`}
        >
            {/* Image Layer */}
            <div className="absolute inset-0 w-full h-full">
                <OptimizedImage
                    src={project.image} 
                    alt={project.title}
                    priority={index < 2}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90 transition-opacity duration-500 z-10" />
            </div>

            {/* Content Layer */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end items-start z-20">
                
                {/* Floating Category Badge (Top Left) */}
                <div className="absolute top-8 left-8">
                     <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-white tracking-wide uppercase">
                        {project.category}
                     </span>
                </div>

                {/* Arrow Icon (Top Right) */}
                <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                    {isInternalDemo ? <Eye size={18} /> : <ArrowUpRight size={18} />}
                </div>

                {/* Text Content */}
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 w-full">
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 leading-tight">
                        {project.title}
                    </h3>
                    
                    <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500">
                        <p className="text-gray-300 text-sm leading-relaxed mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75 max-w-lg">
                            {project.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pb-2">
                            {project.tags.map((tag) => (
                                <span key={tag} className="text-[10px] font-mono text-gray-400 border border-gray-700 rounded px-2 py-0.5">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const Portfolio: React.FC<PortfolioProps> = ({ onOpenChat, onNavigate }) => {
  const { content } = useContent();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projects = content.projects;
  const githubUrl = content.contact.GITHUB_URL;

  const handleOpenDemo = (url: string) => {
    if (url.startsWith('#internal:')) {
        const view = url.replace('#internal:', '') as ViewType;
        onNavigate(view);
    } else {
        window.open(url, '_blank');
    }
  };

  return (
    <section id="portfolio" className="py-24 md:py-32 bg-white relative overflow-hidden">
        <SEO 
            title="Portfólio de Sites | Projetos de Alta Performance"
            description="Veja exemplos reais de sites otimizados, landing pages e aplicações web modernas desenvolvidas com React e Next.js."
            keywords={["Portfólio Frontend", "Exemplos de Landing Page", "Sites React", "Web Design Portfolio"]}
            breadcrumbs={[{ name: "Home", item: "/" }, { name: "Portfólio", item: "/#portfolio" }]}
        />

        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-50/50 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                    <SectionTitle 
                        title="Projetos Recentes" 
                        subtitle="Uma seleção de interfaces desenvolvidas com foco em performance, estética e conversão."
                        alignment="left"
                    />
                </div>
                
                <div className="hidden md:block mb-24">
                     <button 
                        onClick={() => window.open(githubUrl, '_blank')}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors text-sm font-medium group"
                     >
                        <Layers size={16} />
                        <span>Ver repositórios</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                </div>
            </div>

            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[420px]">
                
                {projects[0] && (
                    <ProjectCard 
                        project={projects[0]} 
                        index={0} 
                        onClick={() => setSelectedProject(projects[0])}
                        className="md:col-span-2"
                    />
                )}

                {projects[1] && (
                    <ProjectCard 
                        project={projects[1]} 
                        index={1} 
                        onClick={() => setSelectedProject(projects[1])}
                        className="md:col-span-1"
                    />
                )}

                {projects[2] && (
                    <ProjectCard 
                        project={projects[2]} 
                        index={2} 
                        onClick={() => setSelectedProject(projects[2])}
                        className="md:col-span-1"
                    />
                )}

                {/* Remaining projects mapped regularly if there are more than 3 */}
                {projects.slice(3).map((proj, idx) => (
                    <ProjectCard 
                        key={proj.id}
                        project={proj} 
                        index={idx + 3} 
                        onClick={() => setSelectedProject(proj)}
                        className="md:col-span-1"
                    />
                ))}

                {/* CTA Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="md:col-span-2 rounded-[2rem] bg-primary-600 p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group cursor-pointer"
                    onClick={onOpenChat}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-900/20 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4" />

                    <div className="relative z-10 flex-1 mb-8 md:mb-0">
                        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white mb-4 uppercase tracking-wider backdrop-blur-sm">
                            Comece Hoje
                        </span>
                        <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
                            Tem uma ideia incrível?
                        </h3>
                        <p className="text-primary-100 text-lg max-w-md leading-relaxed">
                            Não deixe seu projeto apenas no papel. Vamos construir algo memorável juntos.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-full bg-white text-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <ArrowRight size={24} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>

        <ProjectModal 
          project={selectedProject} 
          isOpen={!!selectedProject} 
          onClose={() => setSelectedProject(null)} 
          onOpenDemo={handleOpenDemo}
        />
    </section>
  );
};
