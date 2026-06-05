import { useState } from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { ArrowUpRight, BookOpen, Trash2, Upload, X } from "lucide-react";
import { Project } from "../types";
import { PROJECT_IMAGE_MAX_BYTES, isProjectImage } from "../projectImageStorage";

export default function ProjectCard({
  project,
  isExpanded,
  isEditing,
  onUpdate,
  onDelete,
  onExpand,
  onClose,
  onImageUpload,
}: {
  project: Project;
  isExpanded?: boolean;
  isEditing?: boolean;
  onUpdate?: (p: Project) => void;
  onDelete?: () => void;
  onExpand?: () => void;
  onClose?: () => void;
  onImageUpload?: (file: File) => Promise<void> | void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const showCardDetails = isExpanded || isEditing || isHovered;
  const projectHref = getProjectHref(project.projectUrl);

  const handleChange = (field: keyof Project, value: string) => {
    if (onUpdate) onUpdate({ ...project, [field]: value });
  };

  const handleImageUrlChange = (value: string) => {
    if (onUpdate) onUpdate({ ...project, imageUrl: value, imageFileName: undefined });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file || !onImageUpload) return;

    if (!isProjectImage(file)) {
      setImageUploadError("Images only");
      return;
    }

    if (file.size > PROJECT_IMAGE_MAX_BYTES) {
      setImageUploadError("Max 3 MB");
      return;
    }

    try {
      await onImageUpload(file);
      setImageUploadError("");
    } catch {
      setImageUploadError("Upload failed");
    }
  };

  return (
    <motion.div
      layoutId={isExpanded ? undefined : `project-${project.id}`}
      initial={false}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (!isEditing && !isExpanded && project.story) {
          onExpand?.();
        }
      }}
      animate={{
        minHeight: isExpanded ? "auto" : showCardDetails ? "34rem" : "22rem",
      }}
      className={`relative w-full overflow-hidden group bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5 ${isExpanded ? "rounded-[2rem] cursor-default" : project.story && !isEditing ? "rounded-3xl cursor-pointer" : "rounded-3xl"}`}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {isExpanded && !isEditing && (
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose && onClose();
            }}
            className="p-3 bg-black/10 dark:bg-white/10 backdrop-blur-md text-black dark:text-white rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
            title="Close Story"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {isEditing && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete();
            }}
            className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Background Image Container */}
      <div
        className={
          isExpanded
            ? "absolute top-0 left-0 right-0 h-[34rem] md:h-[38rem] w-full pointer-events-none"
            : "absolute inset-0 w-full h-full"
        }
      >
        {isEditing ? (
          <div className="absolute bottom-6 left-6 right-6 z-30 flex justify-start pointer-events-none">
            <div
              className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md p-2 rounded-lg flex flex-col gap-2 pointer-events-auto shadow-lg border border-black/10 dark:border-white/10 max-w-[min(30rem,calc(100%-2rem))]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 rounded-md bg-black/5 dark:bg-white/10 px-2 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-200 cursor-pointer hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                  <Upload className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  <span className="max-w-32 truncate">
                    {project.imageFileName || "Upload image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="sr-only"
                  />
                </label>
                <input
                  type="text"
                  value={project.imageUrl.startsWith("blob:") ? "" : project.imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="bg-transparent border-b border-black/20 dark:border-white/20 text-xs w-48 text-black dark:text-white outline-none"
                  placeholder="or paste image URL..."
                />
              </div>
              {imageUploadError && (
                <span className="text-xs font-medium text-red-500">
                  {imageUploadError}
                </span>
              )}
            </div>
          </div>
        ) : null}
        <img
          src={project.imageUrl}
          alt={project.title}
          className={`w-full h-full object-cover transition-all duration-1000 ease-out ${
            isExpanded
              ? "brightness-95 dark:brightness-90"
              : "group-hover:scale-105 dark:group-hover:brightness-110"
          }`}
        />
        {/* Dark gradient mapping top content visibility */}
        <div
          className={`absolute inset-0 bg-gradient-to-b z-0 transition-opacity duration-1000 ${
            isExpanded
              ? "from-white/70 via-white/80 to-neutral-100 dark:from-black/50 dark:via-black/65 dark:to-neutral-900 opacity-100"
              : "from-white via-white/55 to-white/20 dark:from-black dark:via-black/40 dark:to-black/15 opacity-[0.63] group-hover:opacity-[0.28] dark:group-hover:opacity-[0.14]"
          }`}
        />
        <div
          className={`absolute inset-0 bg-white/40 dark:bg-black/40 z-0 transition-colors duration-500 ${isExpanded ? "bg-transparent" : "group-hover:bg-transparent"}`}
        />
      </div>

      {/* Foreground Content */}
      <motion.div
        layout
        className="relative z-10 p-8 md:p-10 flex flex-col justify-start h-full"
      >
        <motion.div layout onClick={(e) => isEditing && e.stopPropagation()}>
          {isEditing ? (
            <input
              type="text"
              value={project.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full text-2xl lg:text-3xl font-display font-medium text-neutral-900 dark:text-white mb-3 tracking-tight bg-white/20 dark:bg-black/20 px-2 rounded outline-none"
            />
          ) : (
            <h3 className="text-2xl lg:text-3xl font-display font-medium text-neutral-900 dark:text-white mb-4 tracking-tight">
              {project.title}
            </h3>
          )}

          {isEditing ? (
            <input
              type="text"
              value={project.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
              className="w-full text-neutral-800 dark:text-neutral-200 font-light text-lg lg:text-xl bg-white/20 dark:bg-black/20 px-2 mt-1 rounded outline-none"
            />
          ) : (
            <p className="text-neutral-700 dark:text-neutral-300 font-light text-lg lg:text-xl">
              {project.summary}
            </p>
          )}
        </motion.div>

        <motion.div
          layout
          initial={false}
          animate={{
            opacity: showCardDetails ? 1 : 0,
            height: showCardDetails ? "auto" : 0,
            marginTop: showCardDetails ? 24 : 0,
          }}
          className="overflow-hidden pointer-events-auto"
          transition={{
            height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            marginTop: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0 },
          }}
          onClick={(e) => isEditing && e.stopPropagation()}
        >
          {isEditing ? (
            <textarea
              value={project.details}
              onChange={(e) => handleChange("details", e.target.value)}
              className="w-full text-neutral-800 dark:text-neutral-200 text-base leading-relaxed mb-7 bg-white/20 dark:bg-black/20 p-2 rounded outline-none resize-y"
              rows={3}
            />
          ) : (
            <p className="text-neutral-700 dark:text-neutral-200/90 text-base leading-relaxed mb-7 max-w-[92%] transition-colors duration-500">
              {project.details}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {isEditing ? (
              <input
                type="text"
                value={project.projectUrl}
                onChange={(e) => handleChange("projectUrl", e.target.value)}
                className="px-4 py-2 text-xs rounded-full bg-white/40 dark:bg-black/40 text-black dark:text-white outline-none w-32 border border-black/10 dark:border-white/20"
                placeholder="Project URL..."
              />
            ) : (
              projectHref ? (
                <a
                  href={projectHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex transform-gpu items-center gap-2 rounded-full border border-black/10 bg-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-md backdrop-saturate-150 transition-colors duration-200 will-change-[backdrop-filter,opacity,transform] hover:bg-black hover:text-white dark:border-white/20 dark:bg-white/15 dark:text-white dark:hover:bg-white dark:hover:text-black"
                  style={{
                    WebkitBackdropFilter: "blur(12px) saturate(150%)",
                    backdropFilter: "blur(12px) saturate(150%)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  VISIT 查看项目 <ArrowUpRight className="w-4 h-4 ml-1" />
                </a>
              ) : (
                <span className="inline-flex cursor-default items-center rounded-full border border-white/10 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white/70 backdrop-blur-md">
                  {project.projectUrl || "Coming Soon"}
                </span>
              )
            )}

            {!isEditing && (
              project.story &&
              !isExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExpand && onExpand();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-black/10 bg-white/10 text-neutral-800 backdrop-blur-sm transition-all duration-300 text-sm font-semibold uppercase tracking-wider hover:border-black/45 hover:bg-white/20 hover:text-black dark:border-white/20 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <BookOpen className="w-4 h-4 mr-1" /> READ STORY 开发故事
                </button>
              )
            )}
          </div>

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-12 pt-8 pb-12 border-t border-black/10 dark:border-white/10 leading-loose text-neutral-800 dark:text-neutral-200"
            >
              {isEditing ? (
                <textarea
                  value={project.story || ""}
                  onChange={(e) => handleChange("story", e.target.value)}
                  className="w-full min-h-[24rem] rounded-2xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-black/30 p-5 text-sm leading-relaxed text-neutral-900 dark:text-white outline-none resize-y"
                  placeholder="Story content..."
                />
              ) : (
                <div className="markdown-body prose prose-sm dark:prose-invert max-w-none leading-6 prose-p:leading-6 prose-li:leading-6 prose-img:rounded-2xl prose-img:w-full prose-img:my-7 prose-headings:font-display">
                  <ReactMarkdown>{project.story || ""}</ReactMarkdown>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function getProjectHref(value: string) {
  const url = value.trim();

  if (!url || url === "#") return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(url)) return `https://${url}`;

  return "";
}
