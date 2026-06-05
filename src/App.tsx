/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import EditToggle from './components/EditToggle';
import AdminLogin from './components/AdminLogin';
import { MOCK_PROFILE, MOCK_PROJECTS } from './data';
import { Profile, Project } from './types';
import { loadResumePdf, saveResumePdf } from './resumeStorage';
import { loadProjectImages, saveProjectImage } from './projectImageStorage';
import { loadAvatarImage, saveAvatarImage } from './avatarStorage';
import { ADMIN_PASSWORD } from './config';

const ADMIN_SESSION_KEY = 'portfolio_admin_unlocked';
const CONTENT_VERSION = '10';

function getExportedResumeUrl(profile: Profile) {
  if (profile.resumeUrl.startsWith('blob:')) return '/resume.pdf';
  return profile.resumeUrl || '/resume.pdf';
}

function getExportedAvatarUrl(profile: Profile) {
  if (profile.avatarUrl.startsWith('blob:')) {
    return profile.avatarFileName ? `/images/${profile.avatarFileName}` : '';
  }

  return profile.avatarUrl;
}

function getExportedProjectImageUrl(project: Project) {
  if (project.imageUrl.startsWith('blob:')) {
    return project.imageFileName ? `/images/${project.imageFileName}` : '';
  }

  return project.imageUrl;
}

export default function App() {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('admin') === '1' && localStorage.getItem(ADMIN_SESSION_KEY) !== 'true';
    } catch {
      return false;
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isProjectExpanded, setIsProjectExpanded] = useState(false);
  const resumeObjectUrlRef = useRef<string | null>(null);
  const avatarObjectUrlRef = useRef<string | null>(null);
  const projectImageObjectUrlsRef = useRef<Record<string, string>>({});
  const firstScreenScrollLockRef = useRef(false);
  
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem('portfolio_profile');
      return saved ? JSON.parse(saved) : MOCK_PROFILE;
    } catch {
      return MOCK_PROFILE;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const version = localStorage.getItem('portfolio_version');
      if (version !== CONTENT_VERSION) {
        localStorage.removeItem('portfolio_projects');
        localStorage.setItem('portfolio_version', CONTENT_VERSION);
        return MOCK_PROJECTS;
      }
      const saved = localStorage.getItem('portfolio_projects');
      if (saved) {
        let parsed = JSON.parse(saved);
        return parsed;
      }
      return MOCK_PROJECTS;
    } catch {
      return MOCK_PROJECTS;
    }
  });

  useEffect(() => {
    document.documentElement.classList.add('dark');

    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'logout') {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      setIsAdminUnlocked(false);
      setIsEditing(false);
    }

    return () => {
      if (resumeObjectUrlRef.current) {
        URL.revokeObjectURL(resumeObjectUrlRef.current);
      }

      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }

      Object.values(projectImageObjectUrlsRef.current).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (
        event.defaultPrevented ||
        event.deltaY <= 0 ||
        firstScreenScrollLockRef.current
      ) {
        return;
      }

      const portfolio = document.getElementById('portfolio');
      if (!portfolio) return;

      const portfolioTop = portfolio.getBoundingClientRect().top;
      const isStillInHero = window.scrollY < window.innerHeight * 0.6;

      if (isStillInHero && portfolioTop > window.innerHeight * 0.35) {
        event.preventDefault();
        firstScreenScrollLockRef.current = true;

        window.setTimeout(() => {
          window.scrollTo({
            top: portfolio.offsetTop,
            behavior: 'smooth',
          });

          window.setTimeout(() => {
            firstScreenScrollLockRef.current = false;
          }, 650);
        }, 140);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    if (!isAdminUnlocked) {
      setIsEditing(false);
    }
  }, [isAdminUnlocked]);

  useEffect(() => {
    let isMounted = true;

    loadAvatarImage()
      .then((file) => {
        if (!file || !isMounted) return;

        if (avatarObjectUrlRef.current) {
          URL.revokeObjectURL(avatarObjectUrlRef.current);
        }

        const avatarUrl = URL.createObjectURL(file);
        avatarObjectUrlRef.current = avatarUrl;
        setProfile((current) => ({
          ...current,
          avatarUrl,
          avatarFileName: current.avatarFileName || file.name,
        }));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadResumePdf()
      .then((file) => {
        if (!file || !isMounted) return;

        if (resumeObjectUrlRef.current) {
          URL.revokeObjectURL(resumeObjectUrlRef.current);
        }

        const resumeUrl = URL.createObjectURL(file);
        resumeObjectUrlRef.current = resumeUrl;
        setProfile((current) => ({
          ...current,
          resumeUrl,
          resumeFileName: current.resumeFileName || file.name,
        }));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const persistedProfile = {
      ...profile,
      avatarUrl: profile.avatarUrl.startsWith('blob:') ? MOCK_PROFILE.avatarUrl : profile.avatarUrl,
      resumeUrl: profile.resumeUrl.startsWith('blob:') ? '#' : profile.resumeUrl,
    };

    localStorage.setItem('portfolio_profile', JSON.stringify(persistedProfile));
  }, [profile]);

  useEffect(() => {
    const persistedProjects = projects.map((project) => ({
      ...project,
      imageUrl: project.imageUrl.startsWith('blob:') ? '' : project.imageUrl,
    }));

    localStorage.setItem('portfolio_projects', JSON.stringify(persistedProjects));
  }, [projects]);

  useEffect(() => {
    let isMounted = true;

    loadProjectImages()
      .then((records) => {
        if (!isMounted || records.length === 0) return;

        setProjects((currentProjects) =>
          currentProjects.map((project) => {
            const record = records.find((item) => item.projectId === project.id);
            if (!record) return project;

            const previousUrl = projectImageObjectUrlsRef.current[project.id];
            if (previousUrl) {
              URL.revokeObjectURL(previousUrl);
            }

            const imageUrl = URL.createObjectURL(record.file);
            projectImageObjectUrlsRef.current[project.id] = imageUrl;

            return {
              ...project,
              imageUrl,
              imageFileName: project.imageFileName || record.file.name,
            };
          }),
        );
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleResumeUpload = async (file: File) => {
    await saveResumePdf(file);

    if (resumeObjectUrlRef.current) {
      URL.revokeObjectURL(resumeObjectUrlRef.current);
    }

    const resumeUrl = URL.createObjectURL(file);
    resumeObjectUrlRef.current = resumeUrl;
    setProfile((current) => ({
      ...current,
      resumeUrl,
      resumeFileName: file.name,
    }));
  };

  const handleAvatarUpload = async (file: File) => {
    await saveAvatarImage(file);

    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
    }

    const avatarUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = avatarUrl;
    setProfile((current) => ({
      ...current,
      avatarUrl,
      avatarFileName: file.name,
    }));
  };

  const handleProjectImageUpload = async (projectId: string, file: File) => {
    await saveProjectImage(projectId, file);

    const previousUrl = projectImageObjectUrlsRef.current[projectId];
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    const imageUrl = URL.createObjectURL(file);
    projectImageObjectUrlsRef.current[projectId] = imageUrl;

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              imageUrl,
              imageFileName: file.name,
            }
          : project,
      ),
    );
  };

  const handleAdminLogin = (password: string) => {
    if (password !== ADMIN_PASSWORD) return false;

    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    setIsAdminUnlocked(true);
    setIsAdminLoginOpen(false);
    return true;
  };

  const handleExportContent = () => {
    const content = {
      exportedAt: new Date().toISOString(),
      notes: [
        'Put the resume PDF at public/resume.pdf.',
        'Put exported local project images under public/images/ and keep the filenames used here.',
      ],
      profile: {
        ...profile,
        avatarUrl: getExportedAvatarUrl(profile),
        resumeUrl: getExportedResumeUrl(profile),
      },
      projects: projects.map((project) => ({
        ...project,
        imageUrl: getExportedProjectImageUrl(project),
      })),
    };

    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#050505] selection:bg-black/10 dark:selection:bg-white/20 text-neutral-900 dark:text-white relative transition-colors duration-500">
      {isAdminUnlocked && (
        <EditToggle
          isEditing={isEditing}
          onChange={setIsEditing}
          onExport={handleExportContent}
        />
      )}
      {isAdminLoginOpen && (
        <AdminLogin
          onSubmit={handleAdminLogin}
          onClose={() => setIsAdminLoginOpen(false)}
        />
      )}
      <div className="relative z-10">
        <Hero
          profile={profile}
          isEditing={isEditing}
          hideScrollHint={isProjectExpanded}
          onProfileChange={setProfile}
          onAvatarUpload={handleAvatarUpload}
          onResumeUpload={handleResumeUpload}
        />
        <Portfolio
          projects={projects}
          isEditing={isEditing}
          onProjectsChange={setProjects}
          onProjectImageUpload={handleProjectImageUpload}
          onExpandedChange={setIsProjectExpanded}
        />
      </div>
    </main>
  );
}
