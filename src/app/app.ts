import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UiPreferencesService, AppLanguage } from './services/ui-preferences.service';

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

  private lastScrollPosition = 0;
  isTopbarHidden = false;

  constructor(public prefs: UiPreferencesService) {}

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
}
