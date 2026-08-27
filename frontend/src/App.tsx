import React, { useState, useEffect, useRef } from 'react';
import {
  fetchVoices,
  fetchVoicePreview,
  synthesizeSingleVoice,
  synthesizeDialogue,
} from './services/api';
import type {
  Voice,
  Project,
  HistoryItem,
  NavTab,
  AppMode,
  DialogueLine,
  Speaker,
} from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TabSwitcher } from './components/TabSwitcher';
import { DialogueStudio } from './components/DialogueStudio';
import { SingleVoiceStudio } from './components/SingleVoiceStudio';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { VoiceExplorerModal } from './components/VoiceExplorerModal';
import { VoiceExplorerPage } from './components/VoiceExplorerPage';
import { DocumentImportModal } from './components/DocumentImportModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { ProjectsView } from './components/ProjectsView';
import { HistoryView } from './components/HistoryView';
import { TemplatesView } from './components/TemplatesView';
import { SettingsView } from './components/SettingsView';
import { MobileDrawer } from './components/MobileDrawer';
import { DashboardView } from './components/DashboardView';
import {
  FolderOpen,
  Volume2,
  Waves,
  History as HistoryIcon,
  Settings as SettingsIcon,
} from 'lucide-react';

const DEFAULT_DIALOGUE_PROJECT: Project = {
  id: 'proj_default_1',
  title: 'French-English Travel Conversation',
  mode: 'dialogue',
  singleText:
    'The train arrived at 8:30 in the morning on a crisp autumn day. As the steam cleared from the platform, a solitary traveler stepped onto the cobblestones, holding a worn leather journal that held the secrets of an untold era.',
  singleVoiceId: 'en-US-JennyNeural',
  singleRate: 1.0,
  singlePitch: 0.0,
  singleVolume: 1.0,
  speakers: {
    Sarah: {
      id: 'spk_sarah',
      name: 'Sarah',
      gender: 'Female',
      language: 'French',
      accent: 'France',
      flag: '🇫🇷',
      voice_id: 'fr-FR-DeniseNeural',
      color: 'pink',
      rate: 1.0,
      pitch: 0.0,
      volume: 1.0,
    },
    James: {
      id: 'spk_james',
      name: 'James',
      gender: 'Male',
      language: 'English',
      accent: 'British',
      flag: '🇬🇧',
      voice_id: 'en-GB-RyanNeural',
      color: 'blue',
      rate: 1.0,
      pitch: 0.0,
      volume: 1.0,
    },
  },
  lines: [
    { id: '1', speaker_name: 'Sarah', text: 'Bonjour, comment allez-vous?' },
    { id: '2', speaker_name: 'James', text: "I'm doing great. How about you?" },
    { id: '3', speaker_name: 'Sarah', text: 'Je vais bien, merci! Where are you going tomorrow?' },
    { id: '4', speaker_name: 'James', text: "I'm going to Paris. I'll be there for three days." },
    { id: '5', speaker_name: 'Sarah', text: "Oh, c'est magnifique! Have a great trip!" },
    { id: '6', speaker_name: 'James', text: 'Thank you! À bientôt!' },
  ],
  globalRate: 1.0,
  globalPitch: 0.0,
  globalVolume: 1.0,
  pauseBetweenMs: 400,
  audioUrl: null,
  duration: 0,
  updatedAt: new Date().toISOString(),
};

export const App: React.FC = () => {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Modals State
  const [isVoiceExplorerOpen, setIsVoiceExplorerOpen] = useState(false);
  const [voiceExplorerTargetSpeaker, setVoiceExplorerTargetSpeaker] = useState<string | undefined>();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // Audio & Synthesis State
  const [voices, setVoices] = useState<Voice[]>([]);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Projects State
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('voxora_projects');
    return saved ? JSON.parse(saved) : [DEFAULT_DIALOGUE_PROJECT];
  });
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || DEFAULT_DIALOGUE_PROJECT.id);

  // Active Project Helper
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || DEFAULT_DIALOGUE_PROJECT;

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('voxora_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Track Audio URL for Player Bar — only set when audio has been generated
  const [masterAudioUrl, setMasterAudioUrl] = useState<string | null>(null);
  const [masterTrackTitle, setMasterTrackTitle] = useState<string>('');

  // Load Voices Catalog
  useEffect(() => {
    async function loadVoices() {
      const data = await fetchVoices();
      setVoices(data);
    }
    loadVoices();
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem('voxora_projects', JSON.stringify(projects));
  }, [projects]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('voxora_history', JSON.stringify(history));
  }, [history]);

  // Update current project
  const updateActiveProject = (updater: (prev: Project) => Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? updater(p) : p))
    );
  };

  // Preview Voice Action with parameter support
  const handlePreviewVoice = async (voiceId: string, rate = 1.0, pitch = 0.0) => {
    try {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPreviewingVoiceId(voiceId);
      const audioUrl = await fetchVoicePreview(voiceId, undefined, rate, pitch);
      const audio = new Audio(audioUrl);
      previewAudioRef.current = audio;
      audio.onended = () => setPreviewingVoiceId(null);
      audio.onerror = () => setPreviewingVoiceId(null);
      await audio.play();
    } catch (err) {
      console.error('Preview failed:', err);
      setPreviewingVoiceId(null);
    }
  };

  // Generate Audio for Active Project
  const handleGenerateAudio = async () => {
    setIsGenerating(true);
    try {
      let url: string;
      let charCount = 0;

      if (activeProject.mode === 'single') {
        charCount = activeProject.singleText.length;
        url = await synthesizeSingleVoice(
          activeProject.singleText,
          activeProject.singleVoiceId || 'en-US-JennyNeural',
          activeProject.singleRate,
          activeProject.singlePitch,
          activeProject.singleVolume
        );
      } else {
        charCount = activeProject.lines.reduce((acc, l) => acc + l.text.length, 0);
        url = await synthesizeDialogue(
          activeProject.lines,
          activeProject.speakers,
          activeProject.globalRate,
          activeProject.globalPitch,
          activeProject.globalVolume,
          activeProject.pauseBetweenMs
        );
      }

      // Only show player bar after generation
      setMasterAudioUrl(url);
      setMasterTrackTitle(activeProject.title);
      updateActiveProject((p) => ({ ...p, audioUrl: url }));

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: `hist_${Date.now()}`,
        title: activeProject.title,
        mode: activeProject.mode,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: '1:24',
        audioUrl: url,
        characters: charCount,
      };
      setHistory((prev) => [newHistoryItem, ...prev]);
    } catch (err: any) {
      alert(`Audio synthesis failed: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Create New Project (navigate directly to studio)
  const handleNewProject = () => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      title: 'Untitled Project',
      mode: 'dialogue',
      singleText: '',
      singleVoiceId: 'en-US-JennyNeural',
      singleRate: 1.0,
      singlePitch: 0.0,
      singleVolume: 1.0,
      speakers: {
        Sarah: {
          id: 'spk_sarah',
          name: 'Sarah',
          gender: 'Female',
          language: 'French',
          accent: 'France',
          flag: '🇫🇷',
          voice_id: 'fr-FR-DeniseNeural',
          color: 'pink',
          rate: 1.0,
          pitch: 0.0,
          volume: 1.0,
        },
        James: {
          id: 'spk_james',
          name: 'James',
          gender: 'Male',
          language: 'English',
          accent: 'British',
          flag: '🇬🇧',
          voice_id: 'en-GB-RyanNeural',
          color: 'blue',
          rate: 1.0,
          pitch: 0.0,
          volume: 1.0,
        },
      },
      lines: [
        { id: `l_${Date.now()}_1`, speaker_name: 'Sarah', text: '' },
        { id: `l_${Date.now()}_2`, speaker_name: 'James', text: '' },
      ],
      globalRate: 1.0,
      globalPitch: 0.0,
      globalVolume: 1.0,
      pauseBetweenMs: 400,
      audioUrl: null,
      duration: 0,
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    // Clear any previous audio so player bar is hidden for new project
    setMasterAudioUrl(null);
    setCurrentTab('studio');
  };

  // Export Audio Action
  const handleExport = (format: 'mp3' | 'wav') => {
    if (!masterAudioUrl) {
      alert('Please generate audio before exporting.');
      return;
    }
    const a = document.createElement('a');
    a.href = masterAudioUrl;
    a.download = `${activeProject.title.toLowerCase().replace(/\s+/g, '_')}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Apply Template from Dashboard
  const handleApplyTemplate = (tpl: {
    title: string;
    mode: AppMode;
    lines: DialogueLine[];
    speakers: Record<string, Speaker>;
    singleText?: string;
  }) => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      title: tpl.title,
      mode: tpl.mode,
      singleText: tpl.singleText || '',
      singleVoiceId: 'en-US-JennyNeural',
      singleRate: 1.0,
      singlePitch: 0.0,
      singleVolume: 1.0,
      speakers: tpl.speakers,
      lines: tpl.lines,
      globalRate: 1.0,
      globalPitch: 0.0,
      globalVolume: 1.0,
      pauseBetweenMs: 400,
      audioUrl: null,
      duration: 0,
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setMasterAudioUrl(null);
    setCurrentTab('studio');
  };

  // Total character count calculation
  const totalCharsUsed = projects.reduce((acc, p) => {
    if (p.mode === 'single') return acc + p.singleText.length;
    return acc + p.lines.reduce((lAcc, l) => lAcc + l.text.length, 0);
  }, 125430);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc]">
      {/* Desktop Left Sidebar (Hidden on Mobile) */}
      <div className="hidden lg:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onNewProject={handleNewProject}
          characterCount={totalCharsUsed}
        />
      </div>

      {/* Mobile Drawer (Visible on hamburger click) */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNewProject={handleNewProject}
        characterCount={totalCharsUsed}
      />

      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header — now receives currentTab to conditionally show project controls */}
        <Header
          currentTab={currentTab}
          projectTitle={activeProject.title}
          onUpdateTitle={(title) => updateActiveProject((p) => ({ ...p, title }))}
          onExport={handleExport}
          onToggleMobileMenu={() => setIsMobileDrawerOpen(true)}
          isGenerating={isGenerating}
        />

        {/* Main Content View — only Studio tab needs bottom padding for player bar */}
        <div className={`flex-1 overflow-y-auto ${currentTab === 'studio' && masterAudioUrl ? 'pb-24' : 'pb-0'}`}>
          {/* ── DASHBOARD ── */}
          {currentTab === 'dashboard' && (
            <DashboardView
              voices={voices}
              projects={projects}
              history={history}
              onOpenStudio={() => {
                handleNewProject();
              }}
              onOpenVoices={() => setCurrentTab('voices')}
              onSelectProject={(id) => {
                setActiveProjectId(id);
                setCurrentTab('studio');
              }}
              onPlayHistoryAudio={(url, title) => {
                setMasterAudioUrl(url);
                setMasterTrackTitle(title);
              }}
              onApplyTemplate={handleApplyTemplate}
            />
          )}

          {/* ── STUDIO ── */}
          {currentTab === 'studio' && (
            <div>
              {/* Single / Dialogue Tab Switcher */}
              <TabSwitcher
                mode={activeProject.mode}
                onSelectMode={(mode) => updateActiveProject((p) => ({ ...p, mode }))}
                onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
              />

              {/* Dual Studio Modes */}
              {activeProject.mode === 'dialogue' ? (
                <DialogueStudio
                  lines={activeProject.lines}
                  speakers={activeProject.speakers}
                  voices={voices}
                  globalRate={activeProject.globalRate}
                  globalPitch={activeProject.globalPitch}
                  globalVolume={activeProject.globalVolume}
                  pauseBetweenMs={activeProject.pauseBetweenMs}
                  onUpdateLines={(lines) => updateActiveProject((p) => ({ ...p, lines }))}
                  onUpdateSpeakers={(speakers) =>
                    updateActiveProject((p) => ({ ...p, speakers }))
                  }
                  onUpdateGlobalSettings={({ rate, pitch, volume, pauseMs }) =>
                    updateActiveProject((p) => ({
                      ...p,
                      globalRate: rate ?? p.globalRate,
                      globalPitch: pitch ?? p.globalPitch,
                      globalVolume: volume ?? p.globalVolume,
                      pauseBetweenMs: pauseMs ?? p.pauseBetweenMs,
                    }))
                  }
                  onOpenImportModal={() => setIsImportModalOpen(true)}
                  onOpenVoiceExplorer={(speakerName) => {
                    setVoiceExplorerTargetSpeaker(speakerName);
                    setIsVoiceExplorerOpen(true);
                  }}
                  onPreviewVoice={handlePreviewVoice}
                  previewingVoiceId={previewingVoiceId}
                  onGenerateAudio={handleGenerateAudio}
                  isGenerating={isGenerating}
                />
              ) : (
                <SingleVoiceStudio
                  text={activeProject.singleText}
                  voiceId={activeProject.singleVoiceId}
                  rate={activeProject.singleRate}
                  pitch={activeProject.singlePitch}
                  volume={activeProject.singleVolume}
                  voices={voices}
                  onUpdateText={(text) => updateActiveProject((p) => ({ ...p, singleText: text }))}
                  onUpdateVoiceId={(voiceId) =>
                    updateActiveProject((p) => ({ ...p, singleVoiceId: voiceId }))
                  }
                  onUpdateControls={({ rate, pitch, volume }) =>
                    updateActiveProject((p) => ({
                      ...p,
                      singleRate: rate ?? p.singleRate,
                      singlePitch: pitch ?? p.singlePitch,
                      singleVolume: volume ?? p.singleVolume,
                    }))
                  }
                  onOpenImportModal={() => setIsImportModalOpen(true)}
                  onOpenVoiceExplorer={() => {
                    setVoiceExplorerTargetSpeaker(undefined);
                    setIsVoiceExplorerOpen(true);
                  }}
                  onPreviewVoice={handlePreviewVoice}
                  previewingVoiceId={previewingVoiceId}
                  onGenerateAudio={handleGenerateAudio}
                  isGenerating={isGenerating}
                />
              )}
            </div>
          )}

          {/* ── PROJECTS ── */}
          {currentTab === 'projects' && (
            <ProjectsView
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={(id) => {
                setActiveProjectId(id);
                setCurrentTab('studio');
              }}
              onNewProject={handleNewProject}
              onDeleteProject={(id) => {
                if (projects.length <= 1) {
                  alert('You cannot delete the only project.');
                  return;
                }
                const filtered = projects.filter((p) => p.id !== id);
                setProjects(filtered);
                setActiveProjectId(filtered[0].id);
              }}
            />
          )}

          {/* ── VOICES ── */}
          {currentTab === 'voices' && (
            <VoiceExplorerPage
              voices={voices}
              onSelectVoiceForStudio={(voice) => {
                if (activeProject.mode === 'single') {
                  updateActiveProject((p) => ({ ...p, singleVoiceId: voice.id }));
                } else {
                  const firstSpk = Object.keys(activeProject.speakers)[0];
                  if (firstSpk) {
                    updateActiveProject((p) => ({
                      ...p,
                      speakers: {
                        ...p.speakers,
                        [firstSpk]: {
                          ...p.speakers[firstSpk],
                          voice_id: voice.id,
                          language: voice.language,
                          accent: voice.accent,
                          flag: voice.flag,
                          gender: voice.gender,
                        },
                      },
                    }));
                  }
                }
                setCurrentTab('studio');
              }}
              onPreviewVoice={handlePreviewVoice}
              previewingVoiceId={previewingVoiceId}
            />
          )}

          {/* ── TEMPLATES ── */}
          {currentTab === 'templates' && (
            <TemplatesView onApplyTemplate={handleApplyTemplate} />
          )}

          {/* ── HISTORY ── */}
          {currentTab === 'history' && (
            <HistoryView
              history={history}
              onPlayAudio={(url, title) => {
                setMasterAudioUrl(url);
                setMasterTrackTitle(title);
              }}
              onClearHistory={() => setHistory([])}
            />
          )}

          {/* ── SETTINGS ── */}
          {currentTab === 'settings' && <SettingsView />}

          {/* ── FAVORITES ── */}
          {currentTab === 'favorites' && (
            <VoiceExplorerPage
              voices={voices}
              onSelectVoiceForStudio={(voice) => {
                updateActiveProject((p) => ({ ...p, singleVoiceId: voice.id }));
                setCurrentTab('studio');
              }}
              onPreviewVoice={handlePreviewVoice}
              previewingVoiceId={previewingVoiceId}
            />
          )}
        </div>

        {/* ── AUDIO PLAYER BAR — Only visible on Studio tab, only after audio is generated ── */}
        {currentTab === 'studio' && (
          <AudioPlayerBar
            audioUrl={masterAudioUrl}
            trackTitle={masterTrackTitle}
            onUpdateTrackTitle={(title) => {
              setMasterTrackTitle(title);
              updateActiveProject((p) => ({ ...p, title }));
            }}
            onDownload={() => handleExport('mp3')}
            isGenerating={isGenerating}
          />
        )}

        {/* Mobile Bottom Navigation Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around">
          <button
            onClick={() => setCurrentTab('projects')}
            className={`flex flex-col items-center gap-1 ${
              currentTab === 'projects' ? 'text-sky-600 font-bold' : 'text-slate-400'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span className="text-[10px]">Projects</span>
          </button>

          <button
            onClick={() => setCurrentTab('voices')}
            className={`flex flex-col items-center gap-1 ${
              currentTab === 'voices' ? 'text-sky-600 font-bold' : 'text-slate-400'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-[10px]">Voices</span>
          </button>

          {/* Center Studio button — sky blue */}
          <button
            onClick={() => setCurrentTab('studio')}
            className="w-11 h-11 -mt-5 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-300 active:scale-95 transition-all border-2 border-white"
          >
            <Waves className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentTab('history')}
            className={`flex flex-col items-center gap-1 ${
              currentTab === 'history' ? 'text-sky-600 font-bold' : 'text-slate-400'
            }`}
          >
            <HistoryIcon className="w-4 h-4" />
            <span className="text-[10px]">History</span>
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex flex-col items-center gap-1 ${
              currentTab === 'settings' ? 'text-sky-600 font-bold' : 'text-slate-400'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span className="text-[10px]">Settings</span>
          </button>
        </div>
      </div>

      {/* Voice Explorer Modal */}
      <VoiceExplorerModal
        isOpen={isVoiceExplorerOpen}
        onClose={() => setIsVoiceExplorerOpen(false)}
        voices={voices}
        targetSpeakerName={voiceExplorerTargetSpeaker}
        onSelectVoice={(voice) => {
          if (voiceExplorerTargetSpeaker && activeProject.speakers[voiceExplorerTargetSpeaker]) {
            updateActiveProject((p) => ({
              ...p,
              speakers: {
                ...p.speakers,
                [voiceExplorerTargetSpeaker]: {
                  ...p.speakers[voiceExplorerTargetSpeaker],
                  voice_id: voice.id,
                  language: voice.language,
                  accent: voice.accent,
                  flag: voice.flag,
                  gender: voice.gender,
                },
              },
            }));
          } else {
            updateActiveProject((p) => ({ ...p, singleVoiceId: voice.id }));
          }
          setIsVoiceExplorerOpen(false);
        }}
        onPreviewVoice={handlePreviewVoice}
        previewingVoiceId={previewingVoiceId}
      />

      {/* Document Import Modal */}
      <DocumentImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportLines={(importedLines, extractedSpeakers) => {
          updateActiveProject((p) => {
            const newSpeakers = { ...p.speakers };
            extractedSpeakers.forEach((spkName, idx) => {
              if (!newSpeakers[spkName]) {
                const colors: Array<'pink' | 'blue' | 'emerald' | 'amber' | 'purple'> = [
                  'emerald',
                  'amber',
                  'purple',
                  'pink',
                  'blue',
                ];
                newSpeakers[spkName] = {
                  id: `spk_${Date.now()}_${idx}`,
                  name: spkName,
                  gender: 'Female',
                  language: 'English',
                  accent: 'American',
                  flag: '🇺🇸',
                  voice_id: 'en-US-JennyNeural',
                  color: colors[idx % colors.length],
                  rate: 1.0,
                  pitch: 0.0,
                  volume: 1.0,
                };
              }
            });
            return {
              ...p,
              lines: importedLines,
              speakers: newSpeakers,
            };
          });
        }}
      />

      {/* How It Works Guide Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
};

export default App;
