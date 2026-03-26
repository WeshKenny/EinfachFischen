import { Injectable, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';
export type AppLanguage = 'de' | 'fr' | 'it' | 'en';

const translations: Record<AppLanguage, Record<string, string>> = {
  de: {
    home: 'Home',
    about: 'Über uns',
    contact: 'Kontakt',
    lakes: 'Seen',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    heroEyebrow: 'Angeln in der Schweiz',
    heroTitle: 'Dein digitaler Angelbegleiter für die Schweiz',
    heroSubtitle: 'Klare Infos zu Seen, Fischarten und Vorschriften.',
    toMap: 'Zur Karte',
    mapLoading: 'Karte wird geladen...',
    mapSubtitle: 'Interaktive Schweizer Seen-Karte',
    aboutEyebrow: 'Über uns',
    aboutTitle: 'EinfachFischen ist aus eigener Begeisterung fürs Angeln entstanden.',
    aboutText1: 'Wir finden, Angeln ist mehr als nur ein Hobby. Es geht um Zeit draussen, Ruhe am Wasser und darum, gute Spots und wichtige Infos einfach zu finden. Genau deshalb haben wir EinfachFischen gebaut.',
    aboutText2: 'Unser Ziel ist es, der Community etwas zurückzugeben: eine übersichtliche Plattform mit Seen, Fischarten und Regeln, damit man nicht alles einzeln zusammensuchen muss.',
    contactEyebrow: 'Kontakt',
    contactTitle: 'Fragen oder Feedback?',
    contactText: 'Wenn dir etwas auffällt oder ein See ergänzt werden soll, kannst du uns direkt schreiben.',
    name: 'Name',
    email: 'E-Mail',
    message: 'Nachricht',
    sendMessage: 'Nachricht abschicken',
    contactDirect: 'Oder direkt an info@einfachfischen.ch',
    allLakes: 'Alle Seen',
    freeFishing: 'Gratis Fischen',
    byFish: 'Nach Fischart',
    byCanton: 'Nach Kanton',
    resetFilters: 'Filter zurücksetzen',
    allDetails: 'Alle Details ansehen',
    generalInfo: 'Allgemeine Informationen',
    fishingInfo: 'Fischereiinformationen',
    fishSpecies: 'Fischarten',
    area: 'Fläche',
    maxDepth: 'Maximale Tiefe',
    elevation: 'Höhe über Meer',
    cantons: 'Kantone',
    bestSeason: 'Beste Saison',
    permit: 'Bewilligung',
    yes: 'Ja',
    no: 'Nein'
  },
  fr: {
    home: 'Accueil',
    about: 'À propos',
    contact: 'Contact',
    lakes: 'Lacs',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    heroEyebrow: 'Pêche en Suisse',
    heroTitle: 'Ton compagnon numérique pour la pêche en Suisse',
    heroSubtitle: 'Des infos claires sur les lacs, les poissons et les règles.',
    toMap: 'Voir la carte',
    mapLoading: 'Chargement de la carte...',
    mapSubtitle: 'Carte interactive des lacs suisses',
    aboutEyebrow: 'À propos',
    aboutTitle: 'EinfachFischen est né de notre propre passion pour la pêche.',
    aboutText1: 'Pour nous, la pêche est plus qu un hobby. C est le temps passé dehors, le calme au bord de l eau et le fait de trouver facilement les bons spots et les bonnes infos.',
    aboutText2: 'Notre objectif est de rendre quelque chose à la communauté: une plateforme claire avec des lacs, des espèces et des règles.',
    contactEyebrow: 'Contact',
    contactTitle: 'Questions ou retour?',
    contactText: 'Si quelque chose manque ou si un lac doit être ajouté, tu peux nous écrire directement.',
    name: 'Nom',
    email: 'E-mail',
    message: 'Message',
    sendMessage: 'Envoyer le message',
    contactDirect: 'Ou écrire directement à info@einfachfischen.ch',
    allLakes: 'Tous les lacs',
    freeFishing: 'Pêche gratuite',
    byFish: 'Par poisson',
    byCanton: 'Par canton',
    resetFilters: 'Réinitialiser',
    allDetails: 'Voir tous les détails',
    generalInfo: 'Informations générales',
    fishingInfo: 'Informations de pêche',
    fishSpecies: 'Espèces',
    area: 'Surface',
    maxDepth: 'Profondeur max.',
    elevation: 'Altitude',
    cantons: 'Cantons',
    bestSeason: 'Meilleure saison',
    permit: 'Permis',
    yes: 'Oui',
    no: 'Non'
  },
  it: {
    home: 'Home',
    about: 'Chi siamo',
    contact: 'Contatto',
    lakes: 'Laghi',
    themeLight: 'Chiaro',
    themeDark: 'Scuro',
    heroEyebrow: 'Pesca in Svizzera',
    heroTitle: 'Il tuo compagno digitale per la pesca in Svizzera',
    heroSubtitle: 'Informazioni chiare su laghi, pesci e regole.',
    toMap: 'Apri mappa',
    mapLoading: 'Caricamento mappa...',
    mapSubtitle: 'Mappa interattiva dei laghi svizzeri',
    aboutEyebrow: 'Chi siamo',
    aboutTitle: 'EinfachFischen nasce dalla nostra passione per la pesca.',
    aboutText1: 'Per noi la pesca e piu di un hobby. Significa stare all aperto, trovare calma sull acqua e avere accesso semplice ai posti giusti e alle informazioni utili.',
    aboutText2: 'Vogliamo restituire qualcosa alla community: una piattaforma chiara con laghi, specie e regole.',
    contactEyebrow: 'Contatto',
    contactTitle: 'Domande o feedback?',
    contactText: 'Se noti qualcosa o se un lago va aggiunto, puoi scriverci direttamente.',
    name: 'Nome',
    email: 'E-mail',
    message: 'Messaggio',
    sendMessage: 'Invia messaggio',
    contactDirect: 'Oppure scrivi a info@einfachfischen.ch',
    allLakes: 'Tutti i laghi',
    freeFishing: 'Pesca gratuita',
    byFish: 'Per pesce',
    byCanton: 'Per cantone',
    resetFilters: 'Reimposta filtri',
    allDetails: 'Vedi tutti i dettagli',
    generalInfo: 'Informazioni generali',
    fishingInfo: 'Informazioni pesca',
    fishSpecies: 'Specie',
    area: 'Superficie',
    maxDepth: 'Profondita max.',
    elevation: 'Altitudine',
    cantons: 'Cantoni',
    bestSeason: 'Stagione migliore',
    permit: 'Permesso',
    yes: 'Si',
    no: 'No'
  },
  en: {
    home: 'Home',
    about: 'About',
    contact: 'Contact',
    lakes: 'Lakes',
    themeLight: 'Light',
    themeDark: 'Dark',
    heroEyebrow: 'Fishing in Switzerland',
    heroTitle: 'Your digital fishing companion for Switzerland',
    heroSubtitle: 'Clear information on lakes, fish species and regulations.',
    toMap: 'Open map',
    mapLoading: 'Loading map...',
    mapSubtitle: 'Interactive Swiss lake map',
    aboutEyebrow: 'About',
    aboutTitle: 'EinfachFischen started from our own passion for fishing.',
    aboutText1: 'For us, fishing is more than a hobby. It is time outdoors, calm by the water and having the right spots and useful information easy to find.',
    aboutText2: 'We want to give something back to the community: a clear platform with lakes, fish species and rules.',
    contactEyebrow: 'Contact',
    contactTitle: 'Questions or feedback?',
    contactText: 'If something is missing or a lake should be added, you can contact us directly.',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    sendMessage: 'Send message',
    contactDirect: 'Or email info@einfachfischen.ch directly',
    allLakes: 'All lakes',
    freeFishing: 'Free fishing',
    byFish: 'By fish',
    byCanton: 'By canton',
    resetFilters: 'Reset filters',
    allDetails: 'View all details',
    generalInfo: 'General information',
    fishingInfo: 'Fishing information',
    fishSpecies: 'Fish species',
    area: 'Area',
    maxDepth: 'Maximum depth',
    elevation: 'Elevation',
    cantons: 'Cantons',
    bestSeason: 'Best season',
    permit: 'Permit',
    yes: 'Yes',
    no: 'No'
  }
};

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
    return translations[this.language()][key] || translations.de[key] || key;
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
}
