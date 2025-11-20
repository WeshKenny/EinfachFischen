import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Lake {
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
  
  // Patent-Preise
  permitPrices?: {
    daily?: string;
    weekly?: string;
    monthly?: string;
    annual?: string;
    youth?: string;
    link?: string;
  };
  
  // Regeln und Vorschriften
  regulations?: {
    closedSeasons?: string;
    minSizes?: { [fish: string]: string };
    bagLimit?: string;
    additionalRules?: string[];
  };
  
  // Bilder für die Gallery
  images?: string[];
  
  // URL-freundlicher Identifier
  id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LakeService {
  // Signal für den ausgewählten See - für reaktive Updates
  private selectedLakeSignal = signal<Lake | null>(null);
  public selectedLake = this.selectedLakeSignal.asReadonly();

  // Seen-Daten werden aus JSON geladen
  private lakes: Lake[] = [];
  private lakesLoaded = false;

  constructor(private http: HttpClient) {
    // Lade Daten sofort bei Service-Initialisierung
    this.loadLakes();
  }

  /**
   * Lädt die Seen-Daten aus der JSON-Datei
   */
  private async loadLakes(): Promise<void> {
    if (this.lakesLoaded) return;
    
    try {
      this.lakes = await firstValueFrom(
        this.http.get<Lake[]>('/assets/data/lakes.json')
      );
      this.lakesLoaded = true;
      console.log(`✅ ${this.lakes.length} Seen geladen`);
    } catch (error) {
      console.error('❌ Fehler beim Laden der Seen-Daten:', error);
      this.lakes = [];
    }
  }

  /**
   * Gibt alle Seen zurück (wartet auf Laden falls nötig)
   */
  async getLakes(): Promise<Lake[]> {
    await this.loadLakes();
    return this.lakes;
  }

  /**
   * Gibt nur Seen mit kostenlosem Angeln zurück
   */
  async getFreeFishingLakes(): Promise<Lake[]> {
    await this.loadLakes();
    return this.lakes.filter(lake => lake.freeFishing);
  }

  /**
   * Filtert Seen nach Fischart
   */
  async getLakesByFishSpecies(species: string): Promise<Lake[]> {
    await this.loadLakes();
    return this.lakes.filter(lake => 
      lake.fishSpecies.some(fish => 
        fish.toLowerCase().includes(species.toLowerCase())
      )
    );
  }

  /**
   * Filtert Seen nach Kanton
   */
  async getLakesByRegion(canton: string): Promise<Lake[]> {
    await this.loadLakes();
    return this.lakes.filter(lake => 
      lake.cantons.toLowerCase().includes(canton.toLowerCase())
    );
  }

  /**
   * Setzt den aktuell ausgewählten See (für Marker-Klick)
   */
  selectLake(lake: Lake | null): void {
    this.selectedLakeSignal.set(lake);
  }

  /**
   * Findet einen See anhand seiner ID
   */
  async getLakeById(id: string): Promise<Lake | undefined> {
    await this.loadLakes();
    return this.lakes.find(lake => lake.id === id);
  }

  /**
   * Findet einen See anhand seines Namens
   */
  async getLakeByName(name: string): Promise<Lake | undefined> {
    await this.loadLakes();
    return this.lakes.find(lake => 
      lake.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Gibt die Gesamtanzahl der Seen zurück
   */
  async getTotalLakeCount(): Promise<number> {
    await this.loadLakes();
    return this.lakes.length;
  }

  /**
   * Gibt die Anzahl der patentfreien Seen zurück
   */
  async getFreeFishingLakeCount(): Promise<number> {
    await this.loadLakes();
    return this.lakes.filter(lake => lake.freeFishing).length;
  }
}
