import { Component, AfterViewInit, PLATFORM_ID, Inject, Output, EventEmitter, NgZone, ChangeDetectorRef, ChangeDetectionStrategy, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LakeService, Lake } from '../services/lake.service';
import { UiPreferencesService } from '../services/ui-preferences.service';

// Only import the type, not the library itself
import type * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class Map implements AfterViewInit {
  @Output() loadFailed = new EventEmitter<void>();
  private map!: L.Map;
  private L: any;
  private markerClusterGroup: any; // MarkerCluster Group
  private allMarkers: L.Marker[] = []; // Speichert alle Marker
  
  // Verwende Signals für bessere Change Detection
  public selectedLake = signal<Lake | null>(null);
  public isSidebarOpen = signal<boolean>(false);
  public activeFilter = signal<string>('all');
  
  // Zusätzliche normale Properties als Fallback
  public selectedLakeData: Lake | null = null;
  
  // Filter-Statistiken
  public totalLakes: number = 0;
  public freeFishingCount: number = 0;
  
  // Dropdown-Status
  public isFishDropdownOpen: boolean = false;
  public isRegionDropdownOpen: boolean = false;
  public selectedFishFilters: string[] = [];
  public selectedRegionFilters: string[] = [];
  public regionFilterOptions = ['Bern', 'Zürich', 'Luzern', 'Graubünden', 'Tessin', 'Waadt', 'Wallis'];
  public fishFilterOptions = [
    { name: 'Hecht', image: '/assets/fish-pike.svg' },
    { name: 'Forelle', image: '/assets/fish-trout.svg' },
    { name: 'Zander', image: '/assets/fish-zander.svg' },
    { name: 'Barsch', image: '/assets/fish-perch.svg' },
    { name: 'Felchen', image: '/assets/fish-whitefish.svg' },
    { name: 'Saibling', image: '/assets/fish-char.svg' }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private lakeService: LakeService,
    public prefs: UiPreferencesService
  ) {
    // Lade Statistiken beim Start
    this.loadStatistics();
  }

  private async loadStatistics(): Promise<void> {
    this.totalLakes = await this.lakeService.getTotalLakeCount();
    this.freeFishingCount = await this.lakeService.getFreeFishingLakeCount();
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const leafletModule = await import('leaflet');
        this.L = (leafletModule as any).default || leafletModule;
        
        // Import MarkerCluster dynamisch und erweitere Leaflet
        const markerClusterModule = await import('leaflet.markercluster');
        
        this.fixLeafletIconPath();
        
        await new Promise(resolve => setTimeout(resolve, 150));
        
        this.initMap();
        await this.addMarkers();
        
        this.cdr.detectChanges();
        setTimeout(() => this.cdr.detectChanges(), 100);
        setTimeout(() => this.cdr.detectChanges(), 300);
        
        // Global Click Handler zum Schließen der Dropdowns
        document.addEventListener('click', () => {
          if (this.isFishDropdownOpen || this.isRegionDropdownOpen) {
            this.ngZone.run(() => {
              this.isFishDropdownOpen = false;
              this.isRegionDropdownOpen = false;
              this.cdr.detectChanges();
            });
          }
        });
        
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

  private async addMarkers(): Promise<void> {
    console.log('Adding markers...');
    
    // Erstelle MarkerClusterGroup mit Optionen
    this.markerClusterGroup = this.L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      maxClusterRadius: 60,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        let size = 'small';
        let iconSize = 45;
        
        if (count > 20) {
          size = 'large';
          iconSize = 55;
        } else if (count > 10) {
          size = 'medium';
          iconSize = 50;
        }
        
        return this.L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: this.L.point(iconSize, iconSize)
        });
      }
    });
    
    const customIcon = this.L.divIcon({
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const lakes = await this.lakeService.getLakes();
    lakes.forEach(lake => {
      const marker = this.L.marker(lake.coords, { icon: customIcon });
      
      // Speichere Marker mit See-Daten für späteres Filtern
      (marker as any).lakeData = lake;
      this.allMarkers.push(marker);

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
          
          const lakeCopy = { ...lake };
          this.selectedLakeData = lakeCopy;
          this.isSidebarOpen.set(true);
          this.cdr.detectChanges();
        });
      });
      
      // Füge Marker zur Cluster-Gruppe hinzu
      this.markerClusterGroup.addLayer(marker);
    });
    
    // Füge die Cluster-Gruppe zur Karte hinzu
    this.map.addLayer(this.markerClusterGroup);
    
    // Event-Handler für Karten-Klicks (schließt Sidebar)
    this.map.on('click', () => {
      console.log('Map clicked (not marker)');
      this.ngZone.run(() => {
        if (this.isSidebarOpen()) {
          this.closeSidebar();
        }
      });
    });
    
    console.log('Added', lakes.length, 'markers to map with clustering');
    console.log('Map setup complete, ready for interaction');
  }

  // Filter-Methoden
  async filterLakes(filterType: string): Promise<void> {
    this.activeFilter.set(filterType);
    this.selectedFishFilters = [];
    this.selectedRegionFilters = [];
    
    if (filterType === 'all') {
      // Zeige alle Marker mit Clustering
      this.markerClusterGroup.clearLayers();
      this.allMarkers.forEach(marker => {
        this.markerClusterGroup.addLayer(marker);
      });
      console.log('Showing all lakes');
    } else if (filterType === 'free') {
      // Zeige nur patentfreie Seen
      const freeLakes = await this.lakeService.getFreeFishingLakes();
      this.filterMarkersByLakes(freeLakes);
      console.log('Showing only free fishing lakes');
    }
    
    this.cdr.detectChanges();
  }

  async filterByFishSpecies(species: string, event?: Event): Promise<void> {
    event?.stopPropagation();

    const isSelected = this.selectedFishFilters.includes(species);
    this.selectedFishFilters = isSelected
      ? this.selectedFishFilters.filter((entry) => entry !== species)
      : [...this.selectedFishFilters, species];

    if (this.selectedFishFilters.length === 0) {
      await this.applyCombinedFilters();
      return;
    }

    this.activeFilter.set('fish');
    await this.applyCombinedFilters();
    this.cdr.detectChanges();
  }

  async filterByRegion(region: string, event?: Event): Promise<void> {
    event?.stopPropagation();

    const isSelected = this.selectedRegionFilters.includes(region);
    this.selectedRegionFilters = isSelected
      ? this.selectedRegionFilters.filter((entry) => entry !== region)
      : [...this.selectedRegionFilters, region];

    this.activeFilter.set(this.selectedRegionFilters.length > 0 ? 'region' : (this.selectedFishFilters.length > 0 ? 'fish' : 'all'));
    await this.applyCombinedFilters();
    this.cdr.detectChanges();
  }

  private async applyCombinedFilters(): Promise<void> {
    const lakes = await this.lakeService.getLakes();

    const filteredLakes = lakes.filter((lake) => {
      const matchesFish =
        this.selectedFishFilters.length === 0 ||
        this.selectedFishFilters.every((speciesFilter) => lake.fishSpecies.includes(speciesFilter));

      const matchesRegion =
        this.selectedRegionFilters.length === 0 ||
        this.selectedRegionFilters.some((regionFilter) =>
          lake.cantons.toLowerCase().includes(regionFilter.toLowerCase())
        );

      return matchesFish && matchesRegion;
    });

    if (this.selectedFishFilters.length === 0 && this.selectedRegionFilters.length === 0) {
      this.activeFilter.set('all');
    }

    this.filterMarkersByLakes(filteredLakes);
  }

  private filterMarkersByLakes(lakes: Lake[]): void {
    // Entferne alle Marker aus der Cluster-Gruppe
    this.markerClusterGroup.clearLayers();
    
    // Füge nur die gefilterten Marker zur Cluster-Gruppe hinzu
    this.allMarkers.forEach(marker => {
      const lakeData = (marker as any).lakeData as Lake;
      const shouldShow = lakes.some(lake => lake.name === lakeData.name);
      
      if (shouldShow) {
        this.markerClusterGroup.addLayer(marker);
      }
    });
  }

  // Neue Methode zum Schließen der Sidebar
  closeSidebar(): void {
    this.isSidebarOpen.set(false);
    this.selectedLake.set(null);
    this.selectedLakeData = null;
    this.cdr.detectChanges();
    console.log('Sidebar closed');
  }

  // Dropdown Toggle-Methoden
  toggleFishDropdown(event: Event): void {
    event.stopPropagation(); // Verhindere, dass das Event weitergeleitet wird
    this.isFishDropdownOpen = !this.isFishDropdownOpen;
    this.isRegionDropdownOpen = false; // Schließe das andere Dropdown
    this.cdr.detectChanges();
  }

  toggleRegionDropdown(event: Event): void {
    event.stopPropagation();
    this.isRegionDropdownOpen = !this.isRegionDropdownOpen;
    this.isFishDropdownOpen = false; // Schließe das andere Dropdown
    this.cdr.detectChanges();
  }

  // Gibt die ID des Sees zurück (aus Lake-Objekt)
  getLakeId(name: string): string {
    // Fallback falls keine ID vorhanden ist
    return name.toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  isFishSelected(species: string): boolean {
    return this.selectedFishFilters.includes(species);
  }

  isRegionSelected(region: string): boolean {
    return this.selectedRegionFilters.includes(region);
  }
}
