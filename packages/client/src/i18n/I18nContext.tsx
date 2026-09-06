import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLocale } from '@between-us/shared';

// Import locales
import thUI from './th/ui.json';
import thStory from './th/story.json';
import thArchetypes from './th/archetypes.json';
import thDynamics from './th/dynamics.json';
import thEndings from './th/endings.json';

import enUI from './en/ui.json';
import enStory from './en/story.json';
import enArchetypes from './en/archetypes.json';
import enDynamics from './en/dynamics.json';
import enEndings from './en/endings.json';

const dictionaries: Record<SupportedLocale, any> = {
  th: {
    ui: thUI,
    story: thStory,
    archetypes: thArchetypes.archetypes,
    dynamics: thDynamics.dynamics,
    endings: thEndings.endings
  },
  en: {
    ui: enUI,
    story: enStory,
    archetypes: enArchetypes.archetypes,
    dynamics: enDynamics.dynamics,
    endings: enEndings.endings
  }
};

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (l: SupportedLocale) => void;
  t: (key: string) => string;
  getScene: (sceneId: string) => any;
  getChoiceText: (choiceId: string) => string;
  getArchetype: (id: string) => { name: string; subtitle: string; description: string };
  getDynamic: (id: string) => { name: string; subtitle: string; quote: string };
  getEnding: (id: string) => { title: string; subtitle: string; narrative: string };
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    const saved = localStorage.getItem('between_us_language') as SupportedLocale;
    return saved === 'en' ? 'en' : 'th'; // Default Thai
  });

  const setLocale = (l: SupportedLocale) => {
    setLocaleState(l);
    localStorage.setItem('between_us_language', l);
  };

  const currentDict = dictionaries[locale];

  const t = (key: string): string => {
    return currentDict.ui[key] || dictionaries.en.ui[key] || key;
  };

  const getScene = (sceneId: string) => {
    return currentDict.story.scenes[sceneId] || dictionaries.en.story.scenes[sceneId] || {};
  };

  const getChoiceText = (choiceId: string) => {
    return currentDict.story.choices[choiceId] || dictionaries.en.story.choices[choiceId] || choiceId;
  };

  const getArchetype = (id: string) => {
    return currentDict.archetypes[id] || dictionaries.en.archetypes[id] || { name: id, subtitle: '', description: '' };
  };

  const getDynamic = (id: string) => {
    return currentDict.dynamics[id] || dictionaries.en.dynamics[id] || { name: id, subtitle: '', quote: '' };
  };

  const getEnding = (id: string) => {
    return currentDict.endings[id] || dictionaries.en.endings[id] || { title: id, subtitle: '', narrative: '' };
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        getScene,
        getChoiceText,
        getArchetype,
        getDynamic,
        getEnding
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
