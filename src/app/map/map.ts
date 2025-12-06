import { Component, AfterViewInit, PLATFORM_ID, Inject, Output, EventEmitter, NgZone, ChangeDetectorRef, ChangeDetectionStrategy, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LakeService, Lake } from '../services/lake.service';

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private lakeService: LakeService
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
            console.log('Lake data set:', this.selectedLakeData?.name, 'ID:', this.selectedLakeData?.id);
            
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

  async filterByFishSpecies(species: string): Promise<void> {
    this.activeFilter.set('fish');
    const filteredLakes = await this.lakeService.getLakesByFishSpecies(species);
    this.filterMarkersByLakes(filteredLakes);
    console.log(`Filtering by fish species: ${species}, found ${filteredLakes.length} lakes`);
    
    // Schließe das Dropdown nach Auswahl
    this.isFishDropdownOpen = false;
    this.cdr.detectChanges();
  }

  async filterByRegion(region: string): Promise<void> {
    this.activeFilter.set('region');
    const filteredLakes = await this.lakeService.getLakesByRegion(region);
    this.filterMarkersByLakes(filteredLakes);
    console.log(`Filtering by region: ${region}, found ${filteredLakes.length} lakes`);
    
    // Schließe das Dropdown nach Auswahl
    this.isRegionDropdownOpen = false;
    this.cdr.detectChanges();
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
}