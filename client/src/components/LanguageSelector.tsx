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
    { code: 'en', name: 'English' },
    { code: 'zu', name: 'isiZulu' },
    { code: 'st', name: 'Sesotho' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'xh', name: 'isiXhosa' },
  ];
  
  console.log("Current language:", i18n.language);

  const changeLanguage = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <div className="flex items-center">
      <Select value={i18n.language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[140px] h-9 border-muted-foreground/20">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <SelectValue placeholder={t('common.language')} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {language.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;