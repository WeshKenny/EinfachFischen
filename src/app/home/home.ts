import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Map } from '../map/map';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UiPreferencesService } from '../services/ui-preferences.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Map, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  loadError = false;
  cantonFilter?: string;
  @ViewChild('mapSection') mapSection!: ElementRef;

  constructor(
    public prefs: UiPreferencesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const canton = this.route.snapshot.queryParamMap.get('canton');
    if (canton) {
      this.cantonFilter = canton;
      // Karte ist per @defer erst nach etwas Verzögerung im DOM - kurz warten vor dem Scrollen.
      setTimeout(() => this.scrollToMap(), 300);
    }
  }

  scrollToMap() {
    this.mapSection.nativeElement.scrollIntoView({
      behavior: 'smooth'
    });
  }
  // optional: falls du einen Handler statt direkter Zuweisung möchtest
  onMapLoadError() {
    this.loadError = true;
  }
}
