import { Component, signal, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UiPreferencesService, AppLanguage } from './services/ui-preferences.service';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('my-app');
  languages: AppLanguage[] = ['de', 'fr', 'it', 'en'];
  isLanguageMenuOpen = false;
  isMobileMenuOpen = false;

  private lastScrollPosition = 0;
  isTopbarHidden = false;

  constructor(
    public prefs: UiPreferencesService,
    private router: Router,
    private seo: SeoService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateRouteSeo(event.urlAfterRedirects);
      }
    });

    effect(() => {
      this.prefs.language();
      this.updateRouteSeo(this.router.url);
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Wenn mehr als 100px gescrollt wurde und nach unten gescrollt wird
    if (currentScroll > 100 && currentScroll > this.lastScrollPosition) {
      this.isTopbarHidden = true;
    } else {
      this.isTopbarHidden = false;
    }
    
    this.lastScrollPosition = currentScroll;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isLanguageMenuOpen = false;
    this.isMobileMenuOpen = false;
  }

  setLanguage(language: AppLanguage) {
    this.prefs.setLanguage(language);
    this.isLanguageMenuOpen = false;
  }

  toggleLanguageMenu() {
    this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
  }

  closeLanguageMenu() {
    this.isLanguageMenuOpen = false;
  }

  toggleMobileMenu(event: Event) {
    event.stopPropagation();
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  private updateRouteSeo(url: string) {
    if (url.startsWith('/lake/')) {
      return;
    }

    if (url.startsWith('/seen') || url.startsWith('/lakes')) {
      this.seo.setRouteSeo('lakes', this.prefs.language());
      return;
    }

    if (url.startsWith('/about')) {
      this.seo.setRouteSeo('about', this.prefs.language());
      return;
    }

    if (url.startsWith('/contact')) {
      this.seo.setRouteSeo('contact', this.prefs.language());
      return;
    }

    this.seo.setRouteSeo('home', this.prefs.language());
  }
}
