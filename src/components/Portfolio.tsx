import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Project } from "../types";
import ProjectCard from "./ProjectCard";

export default function Portfolio({
  projects,
  isEditing,
  onProjectsChange,
  onProjectImageUpload,
}: {
  projects: Project[];
  isEditing?: boolean;
  onProjectsChange?: (projects: Project[]) => void;
  onProjectImageUpload?: (projectId: string, file: File) => Promise<void> | void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleProjectUpdate = (id: string, updated: Project) => {
    if (!onProjectsChange) return;
    onProjectsChange(projects.map((p) => (p.id === id ? updated : p)));
  };

  const handleAddProject = () => {
    if (!onProjectsChange) return;
    const newProject: Project = {
      id: `p${Date.now()}`,
      title: "New Project",
      summary: "Short summary here",
      details: "Detailed description here",
      imageUrl:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200",
      projectUrl: "#",
      story: "Story content here",
    };
    onProjectsChange([...projects, newProject]);
  };

  const handleDeleteProject = (id: string) => {
    if (!onProjectsChange) return;
    onProjectsChange(projects.filter((p) => p.id !== id));
  };

  const handleExpand = (id: string) => {
    setExpandedId(id);
  };

  const leftCol = projects.filter((_, i) => i % 2 === 0);
  const rightCol = projects.filter((_, i) => i % 2 === 1);

  return (
    <section
      className="w-full max-w-[100rem] mx-auto px-6 md:px-10 pb-32 min-h-[50vh]"
      id="portfolio"
    >
      <AnimatePresence mode="popLayout">
        {!expandedId ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 items-start relative w-full"
          >
            {/* Left Column */}
            <div className="flex flex-col gap-7 md:gap-10">
              {leftCol.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isEditing={isEditing}
                  onUpdate={(proj) => handleProjectUpdate(project.id, proj)}
                  onDelete={() => handleDeleteProject(project.id)}
                  onExpand={() => handleExpand(project.id)}
                  onImageUpload={(file) => onProjectImageUpload?.(project.id, file)}
                />
              ))}
              {isEditing && projects.length % 2 === 0 && (
                <motion.div
                  className="w-full min-h-[24rem] rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  onClick={handleAddProject}
                >
                  <span className="text-4xl text-neutral-400 mb-2">+</span>
                  <span className="text-neutral-500 font-medium tracking-widest uppercase text-xs">
                    Add Project
                  </span>
                </motion.div>
              )}
            </div>

            {/* Right Column - Staggered margin on desktop to form waterfall */}
            <div className="flex flex-col gap-7 md:gap-10 md:mt-24">
              {rightCol.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isEditing={isEditing}
                  onUpdate={(proj) => handleProjectUpdate(project.id, proj)}
                  onDelete={() => handleDeleteProject(project.id)}
                  onExpand={() => handleExpand(project.id)}
                  onImageUpload={(file) => onProjectImageUpload?.(project.id, file)}
                />
              ))}
              {isEditing && projects.length % 2 !== 0 && (
                <motion.div
                  className="w-full min-h-[24rem] rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  onClick={handleAddProject}
                >
                  <span className="text-4xl text-neutral-400 mb-2">+</span>
                  <span className="text-neutral-500 font-medium tracking-widest uppercase text-xs">
                    Add Project
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-6xl mx-auto relative z-10"
          >
            {projects.find((p) => p.id === expandedId) && (
              <ProjectCard
                project={projects.find((p) => p.id === expandedId)!}
                isExpanded={true}
                isEditing={isEditing}
                onUpdate={(proj) => handleProjectUpdate(expandedId, proj)}
                onImageUpload={(file) => onProjectImageUpload?.(expandedId, file)}
                onDelete={() => {
                  handleDeleteProject(expandedId);
                  setExpandedId(null);
                }}
                onClose={() => setExpandedId(null)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
