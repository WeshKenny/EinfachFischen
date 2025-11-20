import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LakeService, Lake } from '../services/lake.service';

@Component({
  selector: 'app-lake-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './lake-detail.html',
  styleUrl: './lake-detail.css'
})
export class LakeDetail implements OnInit {
  lake: Lake | null = null;
  currentImageIndex = 0;
  touchStartX = 0;
  touchEndX = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lakeService: LakeService,
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
        // Force Change Detection nach async Laden
        this.cdr.detectChanges();
      }
    }
  }

  private createId(name: string): string {
    return name.toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Bild-Navigation
  nextImage() {
    if (this.lake?.images && this.currentImageIndex < this.lake.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  previousImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  goToImage(index: number) {
    this.currentImageIndex = index;
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
