import { Component, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('my-app');

  private lastScrollPosition = 0;
  isTopbarHidden = false;

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
}
