import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LakeService, Lake } from '../services/lake.service';
import { WeatherService, WeatherData } from '../services/weather.service';
import { ReportIssueComponent } from '../report-issue/report-issue.component';

@Component({
  selector: 'app-lake-detail',
  imports: [CommonModule, RouterLink, ReportIssueComponent],
  templateUrl: './lake-detail.html',
  styleUrl: './lake-detail.css'
})
export class LakeDetail implements OnInit {
  lake: Lake | null = null;
  currentImageIndex = 0;
  touchStartX = 0;
  touchEndX = 0;
  
  // Wetter-Daten
  weather: WeatherData | null = null;
  isLoadingWeather = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lakeService: LakeService,
    private weatherService: WeatherService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const lakeId = this.route.snapshot.paramMap.get('id');
    if (lakeId) {
      // Nutze die getLakeById Methode vom Service
      this.lake = await this.lakeService.getLakeById(lakeId) || null;
      
      if (!this.lake) {
        console.error(`See mit ID "${lakeId}" nicht gefunden`);
        this.router.navigate(['/']);
      } else {
        console.log(`✓ See geladen: ${this.lake.name}`);
        
        // Lade Wetter-Daten
        this.loadWeather();
        
        // Force Change Detection nach async Laden
        this.cdr.detectChanges();
      }
    }
  }

  // === Wetter laden ===
  loadWeather() {
    if (!this.lake?.coords) {
      console.warn('⚠️ Keine Koordinaten für Wetter verfügbar');
      return;
    }

    this.isLoadingWeather = true;
    // coords ist ein Array [lat, lon]
    this.weatherService.getWeather(this.lake.coords[0], this.lake.coords[1]).subscribe({
      next: (data) => {
        this.weather = data;
        this.isLoadingWeather = false;
        this.cdr.detectChanges();
        if (data) {
          console.log(`✅ Wetter geladen: ${data.temp}°C, ${data.description}`);
        }
      },
      error: (err) => {
        console.error('❌ Fehler beim Laden des Wetters:', err);
        this.isLoadingWeather = false;
        this.cdr.detectChanges();
      }
    });
  }

  getWindDirection(degrees: number): string {
    return this.weatherService.getWindDirection(degrees);
  }

  // Bild-Navigation
  nextImage() {
    if (this.lake?.images && this.currentImageIndex < this.lake.images.length - 1) {
      this.currentImageIndex++;
      this.cdr.detectChanges(); // Force UI update
      console.log(`➡️ Bild ${this.currentImageIndex + 1} / ${this.lake.images.length}`);
    }
  }

  previousImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.cdr.detectChanges(); // Force UI update
      console.log(`⬅️ Bild ${this.currentImageIndex + 1} / ${this.lake?.images?.length || 0}`);
    }
  }

  goToImage(index: number) {
    this.currentImageIndex = index;
    this.cdr.detectChanges(); // Force UI update
    console.log(`🎯 Springe zu Bild ${index + 1}`);
  }

  // Touch-Swipe Handlers
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextImage();
      } else {
        this.previousImage();
      }
    }
  }

  // Utility: Prüfe ob Preis-Daten vorhanden sind
  get hasPrices(): boolean {
    return !!(this.lake?.permitPrices && Object.keys(this.lake.permitPrices).length > 0);
  }

  get hasRegulations(): boolean {
    return !!(this.lake?.regulations && Object.keys(this.lake.regulations).length > 0);
  }
}
