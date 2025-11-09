import { Component, AfterViewInit, PLATFORM_ID, Inject, Output, EventEmitter, NgZone, ChangeDetectorRef, ChangeDetectionStrategy, signal } from '@angular/core';
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
  fishSpecies: string[];
  freeFishing: boolean;
  bestSeason: string;
  permitRequired: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class Map implements AfterViewInit {
  @Output() loadFailed = new EventEmitter<void>();
  private map!: L.Map;
  private L: any;
  
  // Verwende Signals für bessere Change Detection
  public selectedLake = signal<Lake | null>(null);
  public isSidebarOpen = signal<boolean>(false);
  
  // Zusätzliche normale Properties als Fallback
  public selectedLakeData: Lake | null = null;

  private lakes: Lake[] = [
    {
      name: "Genfersee",
      coords: [46.4528, 6.5395],
      area: "580.03 km²",
      maxDepth: "310 m",
      elevation: "372 m",
      cantons: "Genf, Waadt, Wallis",
      fishSpecies: ["Forelle", "Hecht", "Zander", "Barsch", "Felchen"],
      freeFishing: false,
      bestSeason: "April - Oktober",
      permitRequired: "SaNa + Kantonales Patent (GE/VD/VS) erforderlich"
    },
    {
      name: "Bodensee",
      coords: [47.6400, 9.3700],
      area: "536 km²",
      maxDepth: "252 m",
      elevation: "395 m",
      cantons: "Thurgau, St. Gallen",
      fishSpecies: ["Felchen", "Hecht", "Zander", "Barsch", "Karpfen"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Bodensee-Patent (TG/SG) erforderlich"
    },
    {
      name: "Neuenburgersee",
      coords: [46.9048, 6.8631],
      area: "217.9 km²",
      maxDepth: "152 m",
      elevation: "429 m",
      cantons: "Neuenburg, Waadt, Freiburg",
      fishSpecies: ["Forelle", "Hecht", "Barsch", "Felchen"],
      freeFishing: true,
      bestSeason: "April - Oktober",
      permitRequired: "Kein Patent erforderlich - Freies Fischen!"
    },
    {
      name: "Lago Maggiore",
      coords: [46.1100, 8.7000],
      area: "212.5 km²",
      maxDepth: "372 m",
      elevation: "193 m",
      cantons: "Tessin",
      fishSpecies: ["Forelle", "Hecht", "Barsch", "Aal"],
      freeFishing: false,
      bestSeason: "März - November",
      permitRequired: "Licenza di pesca cantonale Ticino erforderlich"
    },
    {
      name: "Vierwaldstättersee",
      coords: [47.0200, 8.3600],
      area: "113.6 km²",
      maxDepth: "214 m",
      elevation: "434 m",
      cantons: "Luzern, Uri, Schwyz, Nidwalden",
      fishSpecies: ["Forelle", "Hecht", "Felchen", "Saibling"],
      freeFishing: false,
      bestSeason: "April - Oktober",
      permitRequired: "SaNa + Vierwaldstättersee-Patent erforderlich"
    },
    {
      name: "Zürichsee",
      coords: [47.2254, 8.7243],
      area: "88.17 km²",
      maxDepth: "136 m",
      elevation: "406 m",
      cantons: "Zürich, St. Gallen, Schwyz",
      fishSpecies: ["Forelle", "Hecht", "Zander", "Barsch", "Felchen"],
      freeFishing: false,
      bestSeason: "März - November",
      permitRequired: "SaNa + Zürichsee-Patent (ZH/SG/SZ) erforderlich"
    },
    {
      name: "Luganersee",
      coords: [46.0100, 8.9600],
      area: "48.7 km²",
      maxDepth: "288 m",
      elevation: "271 m",
      cantons: "Tessin",
      fishSpecies: ["Forelle", "Barsch", "Hecht", "Aal"],
      freeFishing: false,
      bestSeason: "März - November",
      permitRequired: "Licenza di pesca cantonale Ticino erforderlich"
    },
    {
      name: "Thunersee",
      coords: [46.6850, 7.6800],
      area: "48.3 km²",
      maxDepth: "217 m",
      elevation: "558 m",
      cantons: "Bern",
      fishSpecies: ["Forelle", "Hecht", "Felchen", "Egli"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Berner Fischereipatent erforderlich"
    },
    {
      name: "Brienzersee",
      coords: [46.734726, 7.986529],
      area: "29.8 km²",
      maxDepth: "260 m",
      elevation: "564 m",
      cantons: "Bern",
      fishSpecies: ["Forelle", "Saibling", "Felchen"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Berner Fischereipatent erforderlich"
    },
    {
      name: "Bielersee",
      coords: [47.098479, 7.190848],
      area: "39.3 km²",
      maxDepth: "74 m",
      elevation: "429 m",
      cantons: "Bern, Neuenburg",
      fishSpecies: ["Hecht", "Barsch", "Felchen", "Aal"],
      freeFishing: true,
      bestSeason: "April - Oktober",
      permitRequired: "Kein Patent erforderlich - Freies Fischen!"
    },
    {
      name: "Zugersee",
      coords: [47.1300, 8.4900],
      area: "38.3 km²",
      maxDepth: "198 m",
      elevation: "413 m",
      cantons: "Zug, Schwyz, Luzern",
      fishSpecies: ["Forelle", "Hecht", "Felchen", "Saibling"],
      freeFishing: false,
      bestSeason: "April - Oktober",
      permitRequired: "SaNa + Kantonales Patent (ZG/SZ/LU) erforderlich"
    },
    {
      name: "Walensee",
      coords: [47.1300, 9.1800],
      area: "24.1 km²",
      maxDepth: "151 m",
      elevation: "419 m",
      cantons: "St. Gallen, Glarus",
      fishSpecies: ["Forelle", "Saibling", "Felchen"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Kantonales Patent (SG/GL) erforderlich"
    },
    {
      name: "Murtensee",
      coords: [46.9267, 7.0833],
      area: "22.8 km²",
      maxDepth: "45 m",
      elevation: "429 m",
      cantons: "Freiburg, Waadt",
      fishSpecies: ["Hecht", "Barsch", "Felchen"],
      freeFishing: true,
      bestSeason: "April - Oktober",
      permitRequired: "Kein Patent erforderlich - Freies Fischen!"
    },
    {
      name: "Hallwilersee",
      coords: [47.2900, 8.2200],
      area: "10 km²",
      maxDepth: "47 m",
      elevation: "449 m",
      cantons: "Aargau, Luzern",
      fishSpecies: ["Hecht", "Barsch", "Forelle"],
      freeFishing: false,
      bestSeason: "April - September",
      permitRequired: "SaNa + Aargauer Fischereipatent erforderlich"
    },
    {
      name: "Sempachersee",
      coords: [47.1300, 8.1900],
      area: "14.5 km²",
      maxDepth: "87 m",
      elevation: "504 m",
      cantons: "Luzern",
      fishSpecies: ["Hecht", "Zander", "Barsch", "Felchen", "Forelle"],
      freeFishing: false,
      bestSeason: "April - Oktober",
      permitRequired: "SaNa + Luzerner Fischereipatent erforderlich"
    },
    {
      name: "Baldeggersee",
      coords: [47.1950, 8.2600],
      area: "5.2 km²",
      maxDepth: "66 m",
      elevation: "463 m",
      cantons: "Luzern",
      fishSpecies: ["Hecht", "Barsch", "Felchen"],
      freeFishing: false,
      bestSeason: "April - September",
      permitRequired: "SaNa + Luzerner Fischereipatent erforderlich"
    },
    {
      name: "Ägerisee",
      coords: [47.1400, 8.6100],
      area: "7.3 km²",
      maxDepth: "82 m",
      elevation: "724 m",
      cantons: "Zug",
      fishSpecies: ["Forelle", "Hecht", "Saibling", "Felchen"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Zuger Fischereipatent erforderlich"
    },
    {
      name: "Sihlsee",
      coords: [47.1200, 8.7700],
      area: "11 km²",
      maxDepth: "23 m",
      elevation: "889 m",
      cantons: "Schwyz",
      fishSpecies: ["Hecht", "Forelle", "Saibling", "Egli"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Schwyzer Fischereipatent erforderlich"
    },
    {
      name: "Greifensee",
      coords: [47.3550, 8.6800],
      area: "8.5 km²",
      maxDepth: "32 m",
      elevation: "435 m",
      cantons: "Zürich",
      fishSpecies: ["Hecht", "Zander", "Barsch", "Karpfen"],
      freeFishing: false,
      bestSeason: "April - Oktober",
      permitRequired: "SaNa + Zürcher Fischereipatent erforderlich"
    },
    {
      name: "Pfäffikersee",
      coords: [47.355050, 8.779200],
      area: "3.3 km²",
      maxDepth: "36 m",
      elevation: "537 m",
      cantons: "Zürich",
      fishSpecies: ["Hecht", "Barsch", "Karpfen"],
      freeFishing: false,
      bestSeason: "April - September",
      permitRequired: "SaNa + Zürcher Fischereipatent erforderlich"
    },
    {
      name: "Türlersee",
      coords: [47.2717, 8.5000],
      area: "0.5 km²",
      maxDepth: "22 m",
      elevation: "647 m",
      cantons: "Zürich",
      fishSpecies: ["Forelle", "Hecht", "Karpfen"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Zürcher Fischereipatent erforderlich"
    },
    {
      name: "Lago di Poschiavo",
      coords: [46.285218, 10.088104],
      area: "1.98 km²",
      maxDepth: "85 m",
      elevation: "962 m",
      cantons: "Graubünden",
      fishSpecies: ["Forelle", "Saibling", "Hecht"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Bündner Fischereipatent erforderlich"
    },
    {
      name: "Silsersee",
      coords: [46.4300, 9.7450],
      area: "4.1 km²",
      maxDepth: "77 m",
      elevation: "1797 m",
      cantons: "Graubünden",
      fishSpecies: ["Forelle", "Saibling"],
      freeFishing: false,
      bestSeason: "Juni - September",
      permitRequired: "SaNa + Bündner Fischereipatent erforderlich"
    },
    {
      name: "Silvaplanersee",
      coords: [46.4550, 9.7900],
      area: "2.7 km²",
      maxDepth: "78 m",
      elevation: "1791 m",
      cantons: "Graubünden",
      fishSpecies: ["Forelle", "Saibling"],
      freeFishing: false,
      bestSeason: "Juni - September",
      permitRequired: "SaNa + Bündner Fischereipatent erforderlich"
    },
    {
      name: "Klöntalersee",
      coords: [47.0100, 9.0250],
      area: "3.3 km²",
      maxDepth: "47 m",
      elevation: "848 m",
      cantons: "Glarus",
      fishSpecies: ["Forelle", "Saibling", "Hecht"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Glarner Fischereipatent erforderlich"
    },
    {
      name: "Oeschinensee",
      coords: [46.4983, 7.7283],
      area: "1.1 km²",
      maxDepth: "56 m",
      elevation: "1578 m",
      cantons: "Bern",
      fishSpecies: ["Forelle", "Saibling"],
      freeFishing: false,
      bestSeason: "Juni - September",
      permitRequired: "SaNa + Berner Fischereipatent erforderlich"
    },
    {
      name: "Sarnersee",
      coords: [46.8900, 8.2300],
      area: "7.4 km²",
      maxDepth: "52 m",
      elevation: "469 m",
      cantons: "Obwalden",
      fishSpecies: ["Forelle", "Hecht", "Felchen"],
      freeFishing: false,
      bestSeason: "April - Oktober",
      permitRequired: "SaNa + Obwaldner Fischereipatent erforderlich"
    },
    {
      name: "Lungerersee",
      coords: [46.7800, 8.1600],
      area: "2 km²",
      maxDepth: "68 m",
      elevation: "688 m",
      cantons: "Obwalden",
      fishSpecies: ["Forelle", "Saibling"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Obwaldner Fischereipatent erforderlich"
    },
    {
      name: "Lac de Joux",
      coords: [46.6400, 6.2700],
      area: "9.5 km²",
      maxDepth: "34 m",
      elevation: "1004 m",
      cantons: "Waadt",
      fishSpecies: ["Forelle", "Hecht", "Barsch"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Waadtländer Fischereipatent erforderlich"
    },
    {
      name: "Lac de Morat",
      coords: [46.9267, 7.0833],
      area: "22.8 km²",
      maxDepth: "45 m",
      elevation: "429 m",
      cantons: "Freiburg, Waadt",
      fishSpecies: ["Hecht", "Barsch", "Felchen"],
      freeFishing: true,
      bestSeason: "April - Oktober",
      permitRequired: "Kein Patent erforderlich - Freies Fischen!"
    },
    {
      name: "Klingnauer Stausee",
      coords: [47.5750, 8.2450],
      area: "1.4 km²",
      maxDepth: "9 m",
      elevation: "318 m",
      cantons: "Aargau",
      fishSpecies: ["Hecht", "Zander", "Barsch", "Karpfen", "Wels"],
      freeFishing: false,
      bestSeason: "April - Oktober",
      permitRequired: "SaNa + Aargauer Fischereipatent erforderlich"
    },
    {
      name: "Lac de la Gruyère",
      coords: [46.674412, 7.094317],
      area: "10 km²",
      maxDepth: "75 m",
      elevation: "677 m",
      cantons: "Freiburg",
      fishSpecies: ["Forelle", "Hecht", "Felchen", "Egli"],
      freeFishing: false,
      bestSeason: "April - Oktober",
      permitRequired: "SaNa + Freiburger Fischereipatent erforderlich"
    },
    {
      name: "Schiffenensee",
      coords: [46.852775, 7.161646],
      area: "4.2 km²",
      maxDepth: "38 m",
      elevation: "532 m",
      cantons: "Freiburg",
      fishSpecies: ["Hecht", "Barsch", "Felchen"],
      freeFishing: false,
      bestSeason: "April - September",
      permitRequired: "SaNa + Freiburger Fischereipatent erforderlich"
    },
    {
      name: "Lac de Neuchâtel",
      coords: [46.9048, 6.8631],
      area: "217.9 km²",
      maxDepth: "152 m",
      elevation: "429 m",
      cantons: "Neuenburg, Waadt, Freiburg",
      fishSpecies: ["Forelle", "Hecht", "Barsch", "Felchen"],
      freeFishing: true,
      bestSeason: "April - Oktober",
      permitRequired: "Kein Patent erforderlich - Freies Fischen!"
    },
    {
      name: "Untersee (Bodensee)",
      coords: [47.6650, 9.0000],
      area: "63 km²",
      maxDepth: "46 m",
      elevation: "395 m",
      cantons: "Thurgau",
      fishSpecies: ["Hecht", "Zander", "Barsch", "Felchen"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Bodensee-Patent (TG) erforderlich"
    },
    {
      name: "Wägitalersee",
      coords: [47.0900, 8.9100],
      area: "4.2 km²",
      maxDepth: "65 m",
      elevation: "900 m",
      cantons: "Schwyz",
      fishSpecies: ["Forelle", "Saibling"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Schwyzer Fischereipatent erforderlich"
    },
    {
      name: "Lauerzersee",
      coords: [47.0400, 8.6050],
      area: "3.1 km²",
      maxDepth: "14 m",
      elevation: "447 m",
      cantons: "Schwyz",
      fishSpecies: ["Hecht", "Barsch", "Karpfen"],
      freeFishing: false,
      bestSeason: "April - September",
      permitRequired: "SaNa + Schwyzer Fischereipatent erforderlich"
    },
    {
      name: "Lac de Salanfe",
      coords: [46.1500, 6.9833],
      area: "0.5 km²",
      maxDepth: "48 m",
      elevation: "1925 m",
      cantons: "Wallis",
      fishSpecies: ["Forelle", "Saibling"],
      freeFishing: false,
      bestSeason: "Juni - September",
      permitRequired: "SaNa + Walliser Fischereipatent erforderlich"
    },
    {
      name: "Mattmarksee",
      coords: [46.0450, 7.9650],
      area: "1.76 km²",
      maxDepth: "93 m",
      elevation: "2197 m",
      cantons: "Wallis",
      fishSpecies: ["Forelle", "Saibling"],
      freeFishing: false,
      bestSeason: "Juli - September",
      permitRequired: "SaNa + Walliser Fischereipatent erforderlich"
    },
    {
      name: "Caumasee",
      coords: [46.820247, 9.295548],
      area: "0.1 km²",
      maxDepth: "65 m",
      elevation: "997 m",
      cantons: "Graubünden",
      fishSpecies: ["Forelle"],
      freeFishing: false,
      bestSeason: "Mai - September",
      permitRequired: "SaNa + Bündner Fischereipatent erforderlich"
    },
    {
      name: "Davosersee",
      coords: [46.7900, 9.8550],
      area: "0.59 km²",
      maxDepth: "54 m",
      elevation: "1559 m",
      cantons: "Graubünden",
      fishSpecies: ["Forelle", "Saibling"],
      freeFishing: false,
      bestSeason: "Juni - September",
      permitRequired: "SaNa + Bündner Fischereipatent erforderlich"
    },
    {
      name: "Lai da Marmorera",
      coords: [46.502971, 9.635125],
      area: "1.4 km²",
      maxDepth: "65 m",
      elevation: "1680 m",
      cantons: "Graubünden",
      fishSpecies: ["Forelle", "Saibling"],
      freeFishing: false,
      bestSeason: "Juni - September",
      permitRequired: "SaNa + Bündner Fischereipatent erforderlich"
    },
    {
      name: "Arnensee",
      coords: [46.388766, 7.217464],
      area: "0.46 km²",
      maxDepth: "52 m",
      elevation: "1542 m",
      cantons: "Bern",
      fishSpecies: ["Forelle", "Saibling"],
      freeFishing: false,
      bestSeason: "Juni - September",
      permitRequired: "SaNa + Berner Fischereipatent erforderlich"
    },
    {
      name: "Blausee",
      coords: [46.532426, 7.664888],
      area: "0.006 km²",
      maxDepth: "10 m",
      elevation: "887 m",
      cantons: "Bern",
      fishSpecies: ["Forelle"],
      freeFishing: false,
      bestSeason: "Ganzjährig (Naturpark)",
      permitRequired: "Nur mit Sondergenehmigung - Naturschutzgebiet"
    }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const leafletModule = await import('leaflet');
        this.L = (leafletModule as any).default || leafletModule;
        this.fixLeafletIconPath();
        
        await new Promise(resolve => setTimeout(resolve, 150));
        
        this.initMap();
        this.addMarkers();
        
        this.cdr.detectChanges();
        setTimeout(() => this.cdr.detectChanges(), 100);
        setTimeout(() => this.cdr.detectChanges(), 300);
        
        console.log('Map initialization complete - ready for interaction');
      } catch (error) {
        console.error('Error loading map:', error);
        this.loadFailed.emit();
      }
    }   
  }

  // ADD THIS NEW METHOD!
  private fixLeafletIconPath(): void {
    if (this.L?.Icon?.Default) {
      delete (this.L.Icon.Default.prototype as any)._getIconUrl;
      this.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
        iconUrl: 'assets/leaflet/marker-icon.png',
        shadowUrl: 'assets/leaflet/marker-shadow.png',
      });
    }
  }

  private initMap(): void {
    console.log('Initializing map...');
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map element not found!');
      return;
    }
    
    console.log('Map element found:', mapElement.offsetWidth, 'x', mapElement.offsetHeight);
    
    this.map = this.L.map('map', {
      center: [46.8182, 8.2275],
      zoom: 9,
      zoomControl: true,
      minZoom: 8,
      maxZoom: 16,
      preferCanvas: false
    });

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);
    
    // Force map to recalculate its size multiple times to ensure proper rendering
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        console.log('Map size invalidated (100ms)');
      }
    }, 100);
    
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        console.log('Map initialized successfully (300ms)');
      }
    }, 300);
  }

  private addMarkers(): void {
    console.log('Adding markers...');
    const customIcon = this.L.divIcon({
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    this.lakes.forEach(lake => {
      const marker = this.L.marker(lake.coords, { icon: customIcon }).addTo(this.map);

      // Event-Handler für Marker-Klicks mit NgZone für Change Detection
      marker.on('click', (e: any) => {
        // Verhindere Event-Bubbling zur Karte
        if (e.originalEvent) {
          e.originalEvent.stopPropagation();
        }
        
        console.log('=== Marker clicked:', lake.name, '===');
        this.ngZone.run(() => {
          // Zentriere die Karte auf den ausgewählten See
          this.map.panTo(lake.coords);
          
          // WICHTIG: Erst selectedLakeData auf null setzen, um *ngIf neu zu triggern!
          this.selectedLakeData = null;
          this.isSidebarOpen.set(false);
          this.cdr.detectChanges();
          
          // Kurz warten, damit Angular das *ngIf komplett entfernt
          setTimeout(() => {
            // Jetzt die neuen Daten setzen
            const lakeCopy = { ...lake };
            this.selectedLakeData = lakeCopy;
            this.isSidebarOpen.set(true);
            console.log('Lake data set:', this.selectedLakeData.name);
            
            // Change Detection für *ngIf - Template wird neu gerendert
            this.cdr.detectChanges();
            
            // Sidebar öffnen
            setTimeout(() => {
              const sidebar = document.querySelector('.sidebar') as HTMLElement;
              console.log('Opening sidebar for:', this.selectedLakeData?.name);
              
              if (sidebar) {
                sidebar.classList.add('open');
                sidebar.style.right = '0px';
                sidebar.style.opacity = '1';
                console.log('Sidebar opened successfully');
              }
            }, 20);
          }, 50);
        });
      });
    });
    
    // Event-Handler für Karten-Klicks (schließt Sidebar)
    this.map.on('click', () => {
      console.log('Map clicked (not marker)');
      this.ngZone.run(() => {
        if (this.isSidebarOpen()) {
          this.closeSidebar();
        }
      });
    });
    
    console.log('Added', this.lakes.length, 'markers to map');
    console.log('Map setup complete, ready for interaction');
  }

  // Neue Methode zum Schließen der Sidebar
  closeSidebar(): void {
    this.isSidebarOpen.set(false);
    this.selectedLake.set(null);
    this.selectedLakeData = null;
    this.cdr.detectChanges();
    
    // Manuell Sidebar schließen
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    if (sidebar) {
      sidebar.classList.remove('open');
      sidebar.style.right = '-420px';
      sidebar.style.opacity = '0';
      sidebar.style.pointerEvents = 'none';
    }
    console.log('Sidebar closed');
  }
}