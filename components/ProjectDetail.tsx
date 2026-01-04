import React, { useEffect } from 'react';
import { Project } from '../types';
import { IconCheck } from './Icons';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project]);

  return (
    <div className="animate-fade-in pt-24 pb-20">
      {/* Hero Header */}
      <div className="mb-12 space-y-6">
        <div className="flex flex-wrap gap-2">
           {project.category.map(cat => (
             <span key={cat} className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800 text-xs font-medium uppercase tracking-wider">
               {cat}
             </span>
           ))}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{project.title}</h1>
        <p className="text-xl md:text-2xl text-light-textSec dark:text-dark-textSec max-w-3xl">{project.subtitle}</p>
        
        <div className="flex items-center gap-8 text-sm text-gray-500">
           <span>{project.date}</span>
           <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
           <span>{project.tools.join(', ')}</span>
        </div>
      </div>

      {/* Main Image */}
      <div className="w-full aspect-video rounded-3xl overflow-hidden bg-light-secondary dark:bg-dark-secondary mb-16 shadow-2xl">
        <img src={project.galleryUrls[0]} alt={project.title} className="w-full h-full object-cover" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
           <h2 className="text-2xl font-semibold">Overview</h2>
           <p className="text-lg leading-relaxed text-light-textSec dark:text-dark-textSec">
             {project.description}
           </p>
           <p className="text-lg leading-relaxed text-light-textSec dark:text-dark-textSec">
             The process involved iterative prototyping and rigorous testing. We aimed to balance aesthetic minimalism with functional robustness, ensuring that every component served a distinct purpose while maintaining visual harmony.
           </p>
           
           {/* Secondary Images */}
           {project.galleryUrls.slice(1).map((url, idx) => (
             <div key={idx} className="w-full rounded-2xl overflow-hidden mt-8 shadow-lg bg-light-secondary dark:bg-dark-secondary">
               <img src={url} alt={`Detail ${idx}`} className="w-full h-auto" />
             </div>
           ))}
        </div>

        {/* Sidebar Specs */}
        <div className="lg:col-span-1 space-y-12">
           <div>
             <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Technical Specs</h3>
             <ul className="space-y-4">
               {project.specs.map((spec, i) => (
                 <li key={i} className="flex items-start gap-3 text-sm">
                   <IconCheck className="w-5 h-5 text-accent shrink-0" />
                   <span className="text-light-textSec dark:text-dark-textSec">{spec}</span>
                 </li>
               ))}
             </ul>
           </div>

           <div>
             <h3 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">Tools Used</h3>
             <div className="flex flex-wrap gap-2">
               {project.tools.map(tool => (
                 <span key={tool} className="bg-light-secondary dark:bg-dark-secondary px-3 py-1.5 rounded-md text-sm font-medium">
                   {tool}
                 </span>
               ))}
             </div>
           </div>
        </div>
      </div>
      
      {/* Footer Nav */}
      <div className="mt-24 pt-12 border-t border-gray-200 dark:border-gray-800 flex justify-between">
         <button onClick={onBack} className="text-lg font-medium hover:text-accent transition-colors">
           ← All Projects
         </button>
      </div>
    </div>
  );
};