import { Component, AfterViewInit, PLATFORM_ID, Inject, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

// Only import the type, not the library itself
import type * as L from 'leaflet';

interface Lake {
  name: string;
  coords: [number, number];
  area: string;
  maxDepth: string;
  elevation: string;
  cantons: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})
export class Map implements AfterViewInit {
  @Output() loadFailed = new EventEmitter<void>();
  private map!: L.Map;
  private L: any;

  private lakes: Lake[] = [
    // ... your lakes data stays the same
    {
      name: "Lake Geneva (Lac Léman)",
      coords: [46.4528, 6.5395],
      area: "580.03 km²",
      maxDepth: "310 m",
      elevation: "372 m",
      cantons: "Geneva, Vaud, Valais"
    },
    {
      name: "Lake Constance (Bodensee)",
      coords: [47.6067, 9.3950],
      area: "536 km²",
      maxDepth: "252 m",
      elevation: "395 m",
      cantons: "Thurgau, St. Gallen"
    },
    {
      name: "Lake Neuchâtel",
      coords: [46.9048, 6.8631],
      area: "217.9 km²",
      maxDepth: "152 m",
      elevation: "429 m",
      cantons: "Neuchâtel, Vaud, Fribourg"
    },
    {
      name: "Lake Maggiore (Lago Maggiore)",
      coords: [46.1000, 8.7333],
      area: "212.5 km²",
      maxDepth: "372 m",
      elevation: "193 m",
      cantons: "Ticino"
    },
    {
      name: "Lake Lucerne (Vierwaldstättersee)",
      coords: [47.0500, 8.4000],
      area: "113.6 km²",
      maxDepth: "214 m",
      elevation: "434 m",
      cantons: "Lucerne, Uri, Schwyz, Nidwalden"
    },
    {
      name: "Lake Zurich (Zürichsee)",
      coords: [47.2254, 8.7243],
      area: "88.17 km²",
      maxDepth: "136 m",
      elevation: "406 m",
      cantons: "Zurich, St. Gallen, Schwyz"
    },
    {
      name: "Lake Lugano",
      coords: [46.0051, 8.9718],
      area: "48.7 km²",
      maxDepth: "288 m",
      elevation: "271 m",
      cantons: "Ticino"
    },
    {
      name: "Lake Thun (Thunersee)",
      coords: [46.6987, 7.6671],
      area: "48.3 km²",
      maxDepth: "217 m",
      elevation: "558 m",
      cantons: "Bern"
    },
    {
      name: "Lake Brienz (Brienzersee)",
      coords: [46.7314, 8.0394],
      area: "29.8 km²",
      maxDepth: "260 m",
      elevation: "564 m",
      cantons: "Bern"
    },
    {
      name: "Lake Biel (Bielersee)",
      coords: [47.0983, 7.1567],
      area: "39.3 km²",
      maxDepth: "74 m",
      elevation: "429 m",
      cantons: "Bern, Neuchâtel"
    },
    {
      name: "Lake Zug (Zugersee)",
      coords: [47.1167, 8.4833],
      area: "38.3 km²",
      maxDepth: "198 m",
      elevation: "413 m",
      cantons: "Zug, Schwyz, Lucerne"
    },
    {
      name: "Lake Walen (Walensee)",
      coords: [47.1333, 9.2000],
      area: "24.1 km²",
      maxDepth: "151 m",
      elevation: "419 m",
      cantons: "St. Gallen, Glarus"
    },
    {
      name: "Lake Murten (Murtensee)",
      coords: [46.9267, 7.0833],
      area: "22.8 km²",
      maxDepth: "45 m",
      elevation: "429 m",
      cantons: "Fribourg, Vaud"
    },
    {
      name: "Lake Hallwil (Hallwilersee)",
      coords: [47.2833, 8.2167],
      area: "10 km²",
      maxDepth: "47 m",
      elevation: "449 m",
      cantons: "Aargau, Lucerne"
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.L = await import('leaflet');
        this.fixLeafletIconPath();
        this.initMap();
        this.addMarkers();
      } catch (error) {
        this.loadFailed.emit();
      }
    }   
  }

  // ADD THIS NEW METHOD!
  private fixLeafletIconPath(): void {
    // Fix Leaflet's default icon path issues with Angular
    delete (this.L.Icon.Default.prototype as any)._getIconUrl;
    this.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });
  }

  private initMap(): void {
    this.map = this.L.map('map', {
      center: [46.8182, 8.2275],  // Switzerland's center coordinates
      zoom: 9,                     // How zoomed in
      zoomControl: true,           // Show +/- zoom buttons
      minZoom: 8,                  // Can't zoom out more than this
      maxZoom: 13                  // Can't zoom in more than this
    });

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);
  }

  private addMarkers(): void {
    const customIcon = this.L.divIcon({
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });

    this.lakes.forEach(lake => {
      const marker = this.L.marker(lake.coords, { icon: customIcon }).addTo(this.map);

      const popupContent = `
        <h3>${lake.name}</h3>
        <div class="lake-info">
          <div class="info-row">
            <span class="info-label">Area:</span>
            <span class="info-value">${lake.area}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Max Depth:</span>
            <span class="info-value">${lake.maxDepth}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Elevation:</span>
            <span class="info-value">${lake.elevation}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Cantons:</span>
            <span class="info-value">${lake.cantons}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });
    });
  }
}