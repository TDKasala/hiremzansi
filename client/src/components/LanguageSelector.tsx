import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
    { code: 'st', name: 'Sotho', nativeName: 'Sesotho' },
    { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
    { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  ];
  
  // Get the base language code (e.g., 'en' from 'en-US')
  const getCurrentLanguage = () => {
    const langCode = i18n.language;
    // Handle en-ZA format by getting the base language
    return langCode?.split('-')[0] || 'en';
  };
  
  // Get native name for display in dropdown trigger
  const getCurrentNativeName = () => {
    const code = getCurrentLanguage();
    const language = languages.find(lang => lang.code === code);
    return language?.nativeName || 'English';
  };

  const changeLanguage = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <div className="flex items-center">
      <Select value={getCurrentLanguage()} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[140px] h-9 border-muted-foreground/20">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{getCurrentNativeName()}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <span className="flex items-center gap-2">
                <span>{language.nativeName}</span>
                <span className="text-xs text-muted-foreground">({language.name})</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;