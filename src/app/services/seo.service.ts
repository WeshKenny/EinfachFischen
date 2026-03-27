import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { AppLanguage } from './ui-preferences.service';
import { Lake } from './lake.service';

interface SeoConfig {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown> | null;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly siteName = 'EinfachFischen';
  private readonly siteUrl = 'https://einfachfischen.ch';
  private readonly defaultImage = `${this.siteUrl}/assets/einfachfischen.png`;
  private structuredDataScript?: HTMLScriptElement;

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  setRouteSeo(routeKey: 'home' | 'lakes' | 'about' | 'contact', language: AppLanguage): void {
    const config = this.getRouteSeo(routeKey, language);
    this.applySeo(config, language);
  }

  setLakeSeo(lake: Lake, language: AppLanguage, localizedName: string, localizedCantons: string, localizedFish: string[]): void {
    const fishPreview = localizedFish.slice(0, 4).join(', ');
    const description = this.byLanguage(language, {
      de: `${localizedName} in ${localizedCantons}. Infos zu Fischarten, Bewilligung, Saison und Regeln für dieses Angelgewässer in der Schweiz.`,
      fr: `${localizedName} à ${localizedCantons}. Infos sur les poissons, les permis, la saison et les règles de pêche pour ce lac en Suisse.`,
      it: `${localizedName} in ${localizedCantons}. Informazioni su specie di pesci, permessi, stagione e regole di pesca per questo lago in Svizzera.`,
      en: `${localizedName} in ${localizedCantons}. Fish species, permit, season and fishing rules for this lake in Switzerland.`
    });

    const title = this.byLanguage(language, {
      de: `${localizedName} | Angeln & Regeln | ${this.siteName}`,
      fr: `${localizedName} | Pêche & réglementation | ${this.siteName}`,
      it: `${localizedName} | Pesca e regolamenti | ${this.siteName}`,
      en: `${localizedName} | Fishing & regulations | ${this.siteName}`
    });

    const path = `/lake/${lake.id ?? ''}`;
    this.applySeo({
      title,
      description,
      path,
      type: 'article',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Place',
        name: localizedName,
        description,
        url: `${this.siteUrl}${path}`,
        additionalProperty: [
          {
            '@type': 'PropertyValue',
            name: this.byLanguage(language, { de: 'Kantone', fr: 'Cantons', it: 'Cantoni', en: 'Cantons' }),
            value: localizedCantons
          },
          {
            '@type': 'PropertyValue',
            name: this.byLanguage(language, { de: 'Fischarten', fr: 'Poissons', it: 'Specie di pesci', en: 'Fish species' }),
            value: fishPreview
          }
        ]
      }
    }, language);
  }

  private getRouteSeo(routeKey: 'home' | 'lakes' | 'about' | 'contact', language: AppLanguage): SeoConfig {
    const byRoute = {
      home: {
        path: '/',
        title: this.byLanguage(language, {
          de: 'Angeln in der Schweiz | Seen, Fischarten & Regeln | EinfachFischen',
          fr: 'Pêche en Suisse | Lacs, poissons et règles | EinfachFischen',
          it: 'Pesca in Svizzera | Laghi, specie e regole | EinfachFischen',
          en: 'Fishing in Switzerland | Lakes, fish species and rules | EinfachFischen'
        }),
        description: this.byLanguage(language, {
          de: 'Interaktive Plattform für Angeln in der Schweiz mit Seen, Fischarten, Bewilligungen und wichtigen Regeln.',
          fr: 'Plateforme interactive pour la pêche en Suisse avec lacs, espèces, permis et règles importantes.',
          it: 'Piattaforma interattiva per la pesca in Svizzera con laghi, specie, permessi e regole importanti.',
          en: 'Interactive platform for fishing in Switzerland with lakes, fish species, permits and key regulations.'
        }),
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: this.siteName,
          url: this.siteUrl,
          inLanguage: this.locale(language),
          potentialAction: {
            '@type': 'SearchAction',
            target: `${this.siteUrl}/seen?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        }
      },
      lakes: {
        path: '/seen',
        title: this.byLanguage(language, {
          de: 'Seen in der Schweiz | Angelgewässer finden | EinfachFischen',
          fr: 'Lacs en Suisse | Trouver un spot de pêche | EinfachFischen',
          it: 'Laghi in Svizzera | Trova spot di pesca | EinfachFischen',
          en: 'Lakes in Switzerland | Find fishing spots | EinfachFischen'
        }),
        description: this.byLanguage(language, {
          de: 'Übersicht über Schweizer Seen mit wichtigen Infos zu Fischarten, Kantonen und Fischerei.',
          fr: 'Vue d’ensemble des lacs suisses avec infos sur les poissons, les cantons et la pêche.',
          it: 'Panoramica dei laghi svizzeri con informazioni su specie, cantoni e pesca.',
          en: 'Overview of Swiss lakes with useful details on fish species, cantons and fishing.'
        }),
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: this.byLanguage(language, { de: 'Seen', fr: 'Lacs', it: 'Laghi', en: 'Lakes' }),
          url: `${this.siteUrl}/seen`
        }
      },
      about: {
        path: '/about',
        title: this.byLanguage(language, {
          de: `Über uns | ${this.siteName}`,
          fr: `À propos | ${this.siteName}`,
          it: `Chi siamo | ${this.siteName}`,
          en: `About us | ${this.siteName}`
        }),
        description: this.byLanguage(language, {
          de: 'Mehr über EinfachFischen und die Mission, das Fischen in der Schweiz einfacher zugänglich zu machen.',
          fr: 'En savoir plus sur EinfachFischen et sa mission de rendre la pêche en Suisse plus accessible.',
          it: 'Scopri di più su EinfachFischen e sulla missione di rendere la pesca in Svizzera più accessibile.',
          en: 'Learn more about EinfachFischen and the mission to make fishing in Switzerland easier to access.'
        }),
        structuredData: null
      },
      contact: {
        path: '/contact',
        title: this.byLanguage(language, {
          de: `Kontakt | ${this.siteName}`,
          fr: `Contact | ${this.siteName}`,
          it: `Contatto | ${this.siteName}`,
          en: `Contact | ${this.siteName}`
        }),
        description: this.byLanguage(language, {
          de: 'Kontakt für Feedback, Fragen oder Ergänzungen zu Seen und Fischerei-Informationen.',
          fr: 'Contact pour retours, questions ou compléments concernant les lacs et les informations de pêche.',
          it: 'Contatto per feedback, domande o integrazioni su laghi e informazioni di pesca.',
          en: 'Contact for feedback, questions or additions about lakes and fishing information.'
        }),
        structuredData: null
      }
    } satisfies Record<'home' | 'lakes' | 'about' | 'contact', SeoConfig>;

    return byRoute[routeKey];
  }

  private applySeo(config: SeoConfig, language: AppLanguage): void {
    const url = `${this.siteUrl}${config.path}`;
    const image = config.image ?? this.defaultImage;
    const type = config.type ?? 'website';

    this.title.setTitle(config.title);
    this.updateTag('name', 'description', config.description);
    this.updateTag('name', 'robots', config.noindex ? 'noindex, nofollow' : 'index, follow');
    this.updateTag('property', 'og:type', type);
    this.updateTag('property', 'og:url', url);
    this.updateTag('property', 'og:title', config.title);
    this.updateTag('property', 'og:description', config.description);
    this.updateTag('property', 'og:image', image);
    this.updateTag('property', 'og:site_name', this.siteName);
    this.updateTag('property', 'og:locale', this.locale(language));
    this.updateTag('name', 'twitter:card', 'summary_large_image');
    this.updateTag('name', 'twitter:url', url);
    this.updateTag('name', 'twitter:title', config.title);
    this.updateTag('name', 'twitter:description', config.description);
    this.updateTag('name', 'twitter:image', image);
    this.setCanonical(url);
    this.document.documentElement.lang = language;
    this.setStructuredData(config.structuredData ?? null);
  }

  private updateTag(attr: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attr]: key, content });
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }

  private setStructuredData(data: Record<string, unknown> | null): void {
    if (this.structuredDataScript) {
      this.structuredDataScript.remove();
      this.structuredDataScript = undefined;
    }

    if (!data) {
      return;
    }

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
    this.structuredDataScript = script;
  }

  private locale(language: AppLanguage): string {
    return {
      de: 'de_CH',
      fr: 'fr_CH',
      it: 'it_CH',
      en: 'en_CH'
    }[language];
  }

  private byLanguage(language: AppLanguage, values: Record<AppLanguage, string>): string {
    return values[language] ?? values.de;
  }
}
