import { Component, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, Output, EventEmitter, NgZone, ChangeDetectorRef, ChangeDetectionStrategy, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LakeService, Lake } from '../services/lake.service';
import { getFishImageAsset } from '../fish-image-map';
import { getCantonImageAsset } from '../canton-image-map';

import type * as L from 'leaflet';

interface FishFilterOption {
  value: string;
  image: string;
}

interface RegionFilterOption {
  value: string;
  image: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class Map implements AfterViewInit, OnDestroy {
  @Output() loadFailed = new EventEmitter<void>();

  private map!: L.Map;
  private L: any;
  private markerClusterGroup: any;
  private allMarkers: L.Marker[] = [];
  private documentClickHandler?: () => void;

  public selectedLake = signal<Lake | null>(null);
  public isSidebarOpen = signal<boolean>(false);
  public activeFilter = signal<string>('all');
  public selectedLakeData: Lake | null = null;

  public totalLakes = 0;
  public freeFishingCount = 0;

  public isFishDropdownOpen = false;
  public isRegionDropdownOpen = false;
  public selectedFishFilters: string[] = [];
  public selectedRegionFilters: string[] = [];
  public freeFishingOnly = false;

  public fishFilterOptions: FishFilterOption[] = [];
  public regionFilterOptions: RegionFilterOption[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private lakeService: LakeService
  ) {
    this.loadStatistics();
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const leafletModule = await import('leaflet');
      this.L = (leafletModule as any).default || leafletModule;
      await import('leaflet.markercluster');

      this.fixLeafletIconPath();
      await this.loadFilterOptions();
      await new Promise(resolve => setTimeout(resolve, 150));

      this.initMap();
      await this.addMarkers();
      this.cdr.detectChanges();

      this.documentClickHandler = () => {
        if (this.isFishDropdownOpen || this.isRegionDropdownOpen) {
          this.ngZone.run(() => {
            this.isFishDropdownOpen = false;
            this.isRegionDropdownOpen = false;
            this.cdr.detectChanges();
          });
        }
      };
      document.addEventListener('click', this.documentClickHandler);
    } catch (error) {
      console.error('Error loading map:', error);
      this.loadFailed.emit();
    }
  }

  ngOnDestroy(): void {
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
    }
  }

  get fishButtonLabel(): string {
    return this.selectedFishFilters.length > 0
      ? `Nach Fischart (${this.selectedFishFilters.length})`
      : 'Nach Fischart';
  }

  get regionButtonLabel(): string {
    return this.selectedRegionFilters.length > 0
      ? `Nach Kanton (${this.selectedRegionFilters.length})`
      : 'Nach Kanton';
  }

  get hasActiveFilters(): boolean {
    return this.freeFishingOnly || this.selectedFishFilters.length > 0 || this.selectedRegionFilters.length > 0;
  }

  get activeFilterChips(): string[] {
    const chips = [
      ...this.selectedFishFilters.map(fish => `Fisch: ${fish}`),
      ...this.selectedRegionFilters.map(region => `Kanton: ${region}`)
    ];

    if (this.freeFishingOnly) {
      chips.unshift('Gratis Fischen');
    }

    return chips;
  }

  async filterLakes(filterType: string): Promise<void> {
    if (filterType === 'all') {
      this.resetAllFilters();
      return;
    }

    if (filterType === 'free') {
      this.freeFishingOnly = !this.freeFishingOnly;
      await this.applyCombinedFilters();
    }
  }

  toggleFishDropdown(event: Event): void {
    event.stopPropagation();
    this.isFishDropdownOpen = !this.isFishDropdownOpen;
    this.isRegionDropdownOpen = false;
    this.cdr.detectChanges();
  }

  toggleRegionDropdown(event: Event): void {
    event.stopPropagation();
    this.isRegionDropdownOpen = !this.isRegionDropdownOpen;
    this.isFishDropdownOpen = false;
    this.cdr.detectChanges();
  }

  async toggleFishFilter(species: string, event?: Event): Promise<void> {
    event?.stopPropagation();

    if (this.selectedFishFilters.includes(species)) {
      this.selectedFishFilters = this.selectedFishFilters.filter(item => item !== species);
    } else {
      this.selectedFishFilters = [...this.selectedFishFilters, species];
    }

    await this.applyCombinedFilters();
  }

  async toggleRegionFilter(region: string, event?: Event): Promise<void> {
    event?.stopPropagation();

    if (this.selectedRegionFilters.includes(region)) {
      this.selectedRegionFilters = this.selectedRegionFilters.filter(item => item !== region);
    } else {
      this.selectedRegionFilters = [...this.selectedRegionFilters, region];
    }

    await this.applyCombinedFilters();
  }

  async removeFilterChip(chip: string): Promise<void> {
    if (chip === 'Gratis Fischen') {
      this.freeFishingOnly = false;
    } else if (chip.startsWith('Fisch: ')) {
      const fish = chip.replace('Fisch: ', '');
      this.selectedFishFilters = this.selectedFishFilters.filter(item => item !== fish);
    } else if (chip.startsWith('Kanton: ')) {
      const region = chip.replace('Kanton: ', '');
      this.selectedRegionFilters = this.selectedRegionFilters.filter(item => item !== region);
    }

    await this.applyCombinedFilters();
  }

  isFishSelected(species: string): boolean {
    return this.selectedFishFilters.includes(species);
  }

  isRegionSelected(region: string): boolean {
    return this.selectedRegionFilters.includes(region);
  }

  getLakeId(name: string): string {
    return name.toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
    this.selectedLake.set(null);
    this.selectedLakeData = null;
    this.cdr.detectChanges();
  }

  private async loadStatistics(): Promise<void> {
    this.totalLakes = await this.lakeService.getTotalLakeCount();
    this.freeFishingCount = await this.lakeService.getFreeFishingLakeCount();
  }

  private async loadFilterOptions(): Promise<void> {
    const lakes = await this.lakeService.getLakes();
    const uniqueSpecies = [...new Set(lakes.flatMap(lake => lake.fishSpecies || []))]
      .sort((a, b) => a.localeCompare(b, 'de'));

    const uniqueCantons = [...new Set(
      lakes.flatMap(lake => this.extractCantons(lake.cantons))
    )].sort((a, b) => a.localeCompare(b, 'de'));

    this.fishFilterOptions = uniqueSpecies.map(value => ({
      value,
      image: getFishImageAsset(value)
    }));
    this.regionFilterOptions = uniqueCantons.map(value => ({
      value,
      image: getCantonImageAsset(value)
    }));
  }

  private extractCantons(rawCantons: string): string[] {
    return rawCantons
      .split(',')
      .map(canton => canton.trim())
      .filter(Boolean);
  }

  private async applyCombinedFilters(): Promise<void> {
    const lakes = await this.lakeService.getLakes();
    const filteredLakes = lakes.filter(lake => {
      const matchesFree = !this.freeFishingOnly || lake.freeFishing;
      const matchesFish = this.selectedFishFilters.length === 0 || this.selectedFishFilters.every(selectedFish =>
        (lake.fishSpecies || []).some(lakeFish => this.matchesSpecies(lakeFish, selectedFish))
      );
      const lakeCantons = this.extractCantons(lake.cantons);
      const matchesRegion = this.selectedRegionFilters.length === 0 || this.selectedRegionFilters.some(selectedRegion =>
        lakeCantons.some(lakeCanton => lakeCanton.toLowerCase() === selectedRegion.toLowerCase())
      );

      return matchesFree && matchesFish && matchesRegion;
    });

    this.activeFilter.set(this.hasActiveFilters ? 'combined' : 'all');
    this.filterMarkersByLakes(filteredLakes);

    if (this.selectedLakeData) {
      const isStillVisible = filteredLakes.some(lake => lake.name === this.selectedLakeData?.name);
      if (!isStillVisible) {
        this.closeSidebar();
      }
    }

    this.cdr.detectChanges();
  }

  private matchesSpecies(lakeFish: string, selectedFish: string): boolean {
    const normalizedLakeFish = lakeFish.toLowerCase();
    const normalizedSelectedFish = selectedFish.toLowerCase();

    return normalizedLakeFish === normalizedSelectedFish
      || normalizedLakeFish.includes(normalizedSelectedFish)
      || normalizedSelectedFish.includes(normalizedLakeFish);
  }

  private resetAllFilters(): void {
    this.selectedFishFilters = [];
    this.selectedRegionFilters = [];
    this.freeFishingOnly = false;
    this.activeFilter.set('all');
    this.isFishDropdownOpen = false;
    this.isRegionDropdownOpen = false;

    this.markerClusterGroup.clearLayers();
    this.allMarkers.forEach(marker => this.markerClusterGroup.addLayer(marker));
    this.cdr.detectChanges();
  }

  private filterMarkersByLakes(lakes: Lake[]): void {
    this.markerClusterGroup.clearLayers();

    this.allMarkers.forEach(marker => {
      const lakeData = (marker as any).lakeData as Lake;
      const shouldShow = lakes.some(lake => lake.name === lakeData.name);

      if (shouldShow) {
        this.markerClusterGroup.addLayer(marker);
      }
    });
  }

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
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      return;
    }

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

    setTimeout(() => this.map?.invalidateSize(), 100);
    setTimeout(() => this.map?.invalidateSize(), 300);
  }

  private async addMarkers(): Promise<void> {
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
      (marker as any).lakeData = lake;
      this.allMarkers.push(marker);

      marker.on('click', (e: any) => {
        if (e.originalEvent) {
          e.originalEvent.stopPropagation();
        }

        this.ngZone.run(() => {
          this.map.panTo(lake.coords);
          this.selectedLakeData = null;
          this.isSidebarOpen.set(false);
          this.cdr.detectChanges();

          setTimeout(() => {
            this.selectedLakeData = { ...lake };
            this.isSidebarOpen.set(true);
            this.cdr.detectChanges();
          }, 50);
        });
      });

      this.markerClusterGroup.addLayer(marker);
    });

    this.map.addLayer(this.markerClusterGroup);

    this.map.on('click', () => {
      this.ngZone.run(() => {
        if (this.isSidebarOpen()) {
          this.closeSidebar();
        }
      });
    });
  }
}
