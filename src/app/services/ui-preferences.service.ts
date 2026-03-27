import { Injectable, signal } from '@angular/core';
import { CANTON_TRANSLATIONS, FISH_TRANSLATIONS, LAKE_NAME_TRANSLATIONS, UI_TRANSLATIONS } from '../i18n-data';

export type AppTheme = 'light' | 'dark';
export type AppLanguage = 'de' | 'fr' | 'it' | 'en';

@Injectable({ providedIn: 'root' })
export class UiPreferencesService {
  private readonly languageKey = 'ui-language';
  private readonly themeKey = 'ui-theme';

  readonly language = signal<AppLanguage>('de');
  readonly theme = signal<AppTheme>('dark');

  constructor() {
    if (typeof window !== 'undefined') {
      this.theme.set((window.localStorage.getItem(this.themeKey) as AppTheme) || this.getSystemTheme());
    }
    this.applyTheme(this.theme());
  }

  setLanguage(language: AppLanguage) {
    this.language.set(language);
  }

  setTheme(theme: AppTheme) {
    this.theme.set(theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.themeKey, theme);
    }
    this.applyTheme(theme);
  }

  toggleTheme() {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }

  t(key: string): string {
    return UI_TRANSLATIONS[this.language()][key] || UI_TRANSLATIONS.de[key] || key;
  }

  localizeLakeName(name: string): string {
    return this.resolveEntry(LAKE_NAME_TRANSLATIONS[name], name);
  }

  localizeFishName(name: string): string {
    return this.resolveEntry(FISH_TRANSLATIONS[name], name);
  }

  localizeCantonName(name: string): string {
    return this.resolveEntry(CANTON_TRANSLATIONS[name], name);
  }

  localizeCantons(value: string): string {
    return value
      .split(',')
      .map(canton => this.localizeCantonName(canton.trim()))
      .join(', ');
  }

  localizeContent(value?: string | Partial<Record<AppLanguage, string>> | null): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    return this.resolveEntry(value, '');
  }

  private applyTheme(theme: AppTheme) {
    if (typeof document === 'undefined') {
      return;
    }
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');
  }

  private getSystemTheme(): AppTheme {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private resolveEntry(entry: Partial<Record<AppLanguage, string>> | undefined, fallback: string): string {
    if (!entry) {
      return fallback;
    }

    const language = this.language();
    return entry[language] ?? entry.de ?? fallback;
  }
}
