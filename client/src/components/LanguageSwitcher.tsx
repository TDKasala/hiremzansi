import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'st', name: 'Sesotho' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'xh', name: 'isiXhosa' },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select
        value={i18n.language}
        onValueChange={changeLanguage}
      >
        <SelectTrigger className="w-[125px] h-9 px-3">
          <SelectValue placeholder={t('common.language')} />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}