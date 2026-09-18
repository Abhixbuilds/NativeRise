import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { languageList } from '../../i18n';
import { useAuthStore } from '../../store/useAuthStore';

export const LanguageSwitcher = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const { updatePreferredLanguage } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languageList.find(l => l.code === i18n.language) || languageList[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (langCode) => {
    updatePreferredLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        id="language-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-btn bg-white/80 hover:bg-bg-tertiary border border-border text-xs md:text-sm font-medium text-text-primary transition-colors shadow-xs"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-accent" />
        <span className="font-medium">{currentLang.native}</span>
        <span className="text-text-secondary text-[11px] hidden sm:inline">({currentLang.name})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-card bg-white shadow-elevated border border-border p-1.5 focus:outline-none max-h-80 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-text-secondary uppercase border-b border-border mb-1">
            Choose Regional Language
          </div>
          <div className="grid grid-cols-1 gap-0.5">
            {languageList.map((lang) => {
              const isSelected = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs md:text-sm rounded-btn transition-colors ${
                    isSelected ? 'bg-accent-light text-accent-dark font-semibold' : 'text-text-primary hover:bg-bg-tertiary'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-[13px]">{lang.native}</span>
                    <span className="text-[11px] text-text-secondary">{lang.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-accent" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
