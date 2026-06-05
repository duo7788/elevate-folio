import { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Mail, Phone, ArrowDown, Upload, FileText } from 'lucide-react';
import { Profile } from '../types';
import { RESUME_MAX_BYTES, isResumePdf } from '../resumeStorage';
import { AVATAR_IMAGE_MAX_BYTES, isAvatarImage } from '../avatarStorage';

export default function Hero({ 
  profile, 
  isEditing, 
  hideScrollHint,
  onProfileChange,
  onAvatarUpload,
  onResumeUpload,
}: { 
  profile: Profile; 
  isEditing?: boolean;
  hideScrollHint?: boolean;
  onProfileChange?: (p: Profile) => void;
  onAvatarUpload?: (file: File) => Promise<void> | void;
  onResumeUpload?: (file: File) => Promise<void> | void;
}) {
  const [avatarUploadError, setAvatarUploadError] = useState('');
  const [resumeUploadError, setResumeUploadError] = useState('');

  const handleTextChange = (field: keyof Profile, value: string) => {
    if (onProfileChange) {
      onProfileChange({ ...profile, [field]: value });
    }
  };

  const handleAvatarUrlChange = (value: string) => {
    if (onProfileChange) {
      onProfileChange({ ...profile, avatarUrl: value, avatarFileName: undefined });
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file || !onAvatarUpload) return;

    if (!isAvatarImage(file)) {
      setAvatarUploadError('Images only');
      return;
    }

    if (file.size > AVATAR_IMAGE_MAX_BYTES) {
      setAvatarUploadError('Max 3 MB');
      return;
    }

    try {
      await onAvatarUpload(file);
      setAvatarUploadError('');
    } catch {
      setAvatarUploadError('Upload failed');
    }
  };

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file || !onResumeUpload) return;

    if (!isResumePdf(file)) {
      setResumeUploadError('PDF files only');
      return;
    }

    if (file.size > RESUME_MAX_BYTES) {
      setResumeUploadError('Max 5 MB');
      return;
    }

    try {
      await onResumeUpload(file);
      setResumeUploadError('');
    } catch {
      setResumeUploadError('Upload failed');
    }
  };

  return (
    <section className="relative flex min-h-screen w-full max-w-[100rem] mx-auto px-6 md:px-10 pt-32 pb-36 md:pt-40 md:pb-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex w-full flex-col md:flex-row gap-12 lg:gap-24 items-center"
      >
        <div className="flex-1 w-full max-w-full overflow-hidden">
          {isEditing ? (
            <div className="mb-12 flex flex-col items-start gap-3">
              <div className="relative inline-block">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-24 h-24 md:w-[7.2rem] md:h-[7.2rem] rounded-full object-cover border border-black/10 dark:border-white/10 shadow-xl dark:shadow-2xl opacity-60"
                />
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/45">
                  <Upload className="w-6 h-6" />
                  <span className="sr-only">Upload avatar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
              <div className="flex max-w-full flex-col gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white/80 p-2 shadow-lg dark:border-white/10 dark:bg-neutral-800/80">
                  <Upload className="h-4 w-4 shrink-0 text-neutral-600 dark:text-neutral-300" />
                  <input 
                    type="text" 
                    value={profile.avatarUrl.startsWith('blob:') ? '' : profile.avatarUrl} 
                    onChange={(e) => handleAvatarUrlChange(e.target.value)}
                    className="w-64 max-w-[70vw] bg-transparent text-xs text-black outline-none dark:text-white"
                    placeholder={profile.avatarFileName || 'or paste avatar URL...'}
                  />
                </div>
                {avatarUploadError && (
                  <span className="text-xs font-medium text-red-500">
                    {avatarUploadError}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-24 h-24 md:w-[7.2rem] md:h-[7.2rem] rounded-full mb-8 object-cover border border-black/10 dark:border-white/10 shadow-xl dark:shadow-2xl"
            />
          )}

          {isEditing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleTextChange('name', e.target.value)}
              className="block w-full text-3xl md:text-4xl lg:text-5xl font-display tracking-tight text-neutral-900 dark:text-white mb-6 font-medium bg-transparent border-b border-black/10 dark:border-white/10 focus:outline-none"
            />
          ) : (
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display tracking-tight text-neutral-900 dark:text-white mb-6 font-medium title-transition">
              {profile.name}
            </h1>
          )}

          {isEditing ? (
            <textarea
              value={profile.bio}
              onChange={(e) => handleTextChange('bio', e.target.value)}
              className="block w-full text-lg md:text-2xl text-neutral-600 dark:text-neutral-400 font-sans font-normal leading-relaxed mb-10 bg-transparent border border-black/10 dark:border-white/10 rounded-lg p-2 focus:outline-none resize-y"
              rows={3}
            />
          ) : (
            <p className="w-full max-w-none text-lg md:text-2xl text-neutral-600 dark:text-neutral-400 font-sans font-normal leading-relaxed mb-10">
              {profile.bio}
            </p>
          )}

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
          {isEditing ? (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <Mail className="w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={profile.email}
                onChange={(e) => handleTextChange('email', e.target.value)}
                className="bg-transparent text-neutral-700 dark:text-neutral-300 text-sm font-medium focus:outline-none w-48"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium transition-colors duration-500">
              <Mail className="w-4 h-4 text-neutral-500" />
              {profile.email}
            </div>
          )}

          {isEditing ? (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <Phone className="w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => handleTextChange('phone', e.target.value)}
                className="bg-transparent text-neutral-700 dark:text-neutral-300 text-sm font-medium focus:outline-none w-32"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium transition-colors duration-500">
              <Phone className="w-4 h-4 text-neutral-500" />
              {profile.phone}
            </div>
          )}

          {isEditing ? (
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                <FileText className="w-4 h-4 text-neutral-500" />
                <span className="max-w-48 truncate">
                  {profile.resumeFileName || 'Upload PDF'}
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleResumeFileChange}
                  className="sr-only"
                />
              </label>
              {resumeUploadError && (
                <span className="pl-4 text-xs font-medium text-red-500">
                  {resumeUploadError}
                </span>
              )}
            </div>
          ) : (
            <motion.div layout className="flex items-center mt-2 sm:mt-0 bg-black dark:bg-white rounded-full overflow-hidden h-[42px] border border-transparent dark:border-white/10 shadow-md">
              <a
                href={profile.resumeUrl || '/resume.pdf'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-6 justify-center text-white dark:text-black text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0 h-full cursor-pointer"
              >
                <Download className="w-4 h-4" /> 
                Résumé 求职简历
              </a>
            </motion.div>
          )}
        </div>
        </div>
      </motion.div>

      {!hideScrollHint && (
        <motion.a
          href="#portfolio"
          onClick={(e) => {
            e.preventDefault();
            const portfolio = document.getElementById("portfolio");
            if (!portfolio) return;

            window.scrollTo({
              top: portfolio.offsetTop,
              behavior: "smooth",
            });
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 text-neutral-700 transition-colors hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
        >
           <ArrowDown className="w-5 h-5 animate-bounce" />
           <span className="flex flex-col text-sm uppercase tracking-widest font-semibold leading-relaxed sm:flex-row sm:items-center sm:gap-2">
             <span>Scroll to explore</span>
             <span className="hidden sm:inline">/</span>
             <span className="text-[0.78rem] text-neutral-600 dark:text-neutral-400">下滑查看项目列表</span>
           </span>
        </motion.a>
      )}
    </section>
  );
}
