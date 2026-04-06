
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ExternalLink, Trophy, Lightbulb, Zap } from 'lucide-react';
import { Project } from '../types';
import { Button } from './Button';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../config';
import { OptimizedImage } from './OptimizedImage';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDemo: (url: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose, onOpenDemo }) => {
  if (!project) return null;

  // Schema específico do projeto (CreativeWork / SoftwareSourceCode)
  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": project.title,
    "description": project.description,
    "image": project.image,
    "creator": {
        "@type": "Organization",
        "name": "PH Development"
    },
    "keywords": project.tags.join(", "),
    "url": `${SITE_CONFIG.URL}/#project-${project.id}`,
    "inLanguage": "pt-BR",
    "isAccessibleForFree": true,
    "accessMode": ["visual", "textual"]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-6">
          
          {/* Dynamic SEO for Modal State */}
          <Helmet>
             <title>{`${project.title} | Case Study`}</title>
             <meta name="description" content={project.description} />
             <script type="application/ld+json">
                {JSON.stringify(projectSchema)}
             </script>
          </Helmet>

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            
            {/* Header Image */}
            <div className="relative h-48 sm:h-64 shrink-0">
              <OptimizedImage
                src={project.image} 
                alt={project.title} 
                priority={true}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-colors z-20"
                aria-label="Fechar Modal"
              >
                <X size={20} />
              </button>

              <div className="absolute bottom-6 left-6 sm:left-8 z-20">
                <span className="px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-bold uppercase tracking-wider mb-2 inline-block shadow-lg">
                  {project.category}
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                  {project.title}
                </h2>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                
                <div className="flex-1 space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                       Sobre o Projeto
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {project.challenge && (
                    <div className="space-y-6">
                        <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                            <div className="flex items-center gap-2 mb-2 text-red-700 font-bold text-sm uppercase tracking-wide">
                                <Lightbulb size={18} /> O Desafio
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{project.challenge}</p>
                        </div>

                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold text-sm uppercase tracking-wide">
                                <Zap size={18} /> A Solução
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{project.solution}</p>
                        </div>

                        <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                            <div className="flex items-center gap-2 mb-2 text-green-700 font-bold text-sm uppercase tracking-wide">
                                <Trophy size={18} /> Resultados
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{project.result}</p>
                        </div>
                    </div>
                  )}
                </div>

                <div className="lg:w-1/3 space-y-8">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                      Tecnologias
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg border border-gray-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <Button 
                      onClick={() => onOpenDemo(project.demoUrl)}
                      className="w-full justify-center shadow-xl shadow-primary-600/20"
                      size="lg"
                      rightIcon={project.demoUrl.startsWith('#internal') ? <ArrowRight size={18} /> : <ExternalLink size={18} />}
                    >
                      {project.demoUrl.startsWith('#internal') ? 'Ver Demo Interativa' : 'Visitar Site Online'}
                    </Button>
                    <p className="text-center text-xs text-gray-400 mt-3">
                      {project.demoUrl.startsWith('#internal') ? 'Experiência imersiva dentro do portfólio' : 'Abre em uma nova aba'}
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
