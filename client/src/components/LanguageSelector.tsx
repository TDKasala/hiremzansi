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
    <Select value={getCurrentLanguage()} onValueChange={changeLanguage}>
      <SelectTrigger className="w-[100px] h-8 border-0 bg-transparent hover:bg-accent/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200">
        <div className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">{getCurrentNativeName()}</span>
        </div>
      </SelectTrigger>
      <SelectContent className="min-w-[140px]">
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code} className="cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{language.nativeName}</span>
              <span className="text-xs text-muted-foreground ml-2">({language.name})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;