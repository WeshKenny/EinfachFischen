import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  windSpeed: number;
  windDeg: number;
  humidity: number;
  pressure: number;
  clouds: number;
  rainChance: number;
  sunrise: number;
  sunset: number;
  moonPhase: string;
  moonPhaseEmoji: string;
}

interface CachedWeather {
  data: WeatherData;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  // Open-Meteo API - KEIN API Key nötig! 🎉
  private readonly API_URL = 'https://api.open-meteo.com/v1/forecast';
  
  // Cache Konfiguration
  private readonly CACHE_DURATION_MS = 30 * 60 * 1000; // 30 Minuten
  private readonly CACHE_KEY_PREFIX = 'weather_';
  
  // In-Memory Cache (für schnelleren Zugriff)
  private memoryCache = new Map<string, CachedWeather>();

  constructor(private http: HttpClient) {
    this.loadCacheFromStorage();
    console.log('✅ WeatherService initialisiert (Open-Meteo - keine Anmeldung nötig!)');
  }

  /**
   * Holt Wetterdaten für Koordinaten mit intelligentem Caching
   */
  getWeather(lat: number, lon: number): Observable<WeatherData | null> {
    const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
    
    // 1. Prüfe Memory Cache
    const cached = this.memoryCache.get(cacheKey);
    if (cached && this.isCacheValid(cached.timestamp)) {
      console.log(`☀️ Wetter aus Cache geladen (${this.getCacheAge(cached.timestamp)} Min alt)`);
      return of(cached.data);
    }

    // 2. Prüfe localStorage Cache
    const storedCache = this.getCacheFromStorage(cacheKey);
    if (storedCache && this.isCacheValid(storedCache.timestamp)) {
      console.log(`☀️ Wetter aus localStorage geladen (${this.getCacheAge(storedCache.timestamp)} Min alt)`);
      this.memoryCache.set(cacheKey, storedCache);
      return of(storedCache.data);
    }

    // 3. API Aufruf (nur wenn Cache abgelaufen)
    console.log(`🌐 Neuer API-Aufruf für Wetter (Cache abgelaufen oder nicht vorhanden)`);
    return this.fetchWeatherFromAPI(lat, lon, cacheKey);
  }

  /**
   * Holt Wetterdaten von Open-Meteo API (kein API Key nötig!)
   */
  private fetchWeatherFromAPI(lat: number, lon: number, cacheKey: string): Observable<WeatherData | null> {
    const params = {
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m',
      timezone: 'Europe/Zurich'
    };

    return this.http.get<any>(this.API_URL, { params }).pipe(
      map(response => this.parseWeatherResponse(response)),
      tap(weatherData => {
        // Cache speichern
        const cached: CachedWeather = {
          data: weatherData,
          timestamp: Date.now()
        };
        this.memoryCache.set(cacheKey, cached);
        this.saveCacheToStorage(cacheKey, cached);
        console.log(`✅ Wetter erfolgreich geladen und gecacht (Open-Meteo)`);
      }),
      catchError(error => {
        console.error('❌ Fehler beim Laden des Wetters:', error);
        return of(null);
      })
    );
  }

  /**
   * Parst Open-Meteo Response zu unserem WeatherData Format
   */
  private parseWeatherResponse(response: any): WeatherData {
    const moonPhase = this.calculateMoonPhase(new Date());
    const current = response.current;
    
    // WMO Weather Code zu Beschreibung (Deutsch)
    const weatherDesc = this.getWeatherDescription(current.weather_code);
    
    return {
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      description: weatherDesc.description,
      icon: weatherDesc.icon,
      windSpeed: Math.round(current.wind_speed_10m),
      windDeg: current.wind_direction_10m,
      humidity: current.relative_humidity_2m,
      pressure: 1013, // Open-Meteo Free hat keinen Druck, Standardwert
      clouds: current.cloud_cover,
      rainChance: 0, // Nicht in aktuellen Daten
      sunrise: 0, // Würde extra API call brauchen
      sunset: 0,  // Würde extra API call brauchen
      moonPhase: moonPhase.phase,
      moonPhaseEmoji: moonPhase.emoji
    };
  }

  /**
   * Konvertiert WMO Weather Code zu deutscher Beschreibung
   * https://open-meteo.com/en/docs
   */
  private getWeatherDescription(code: number): { description: string; icon: string } {
    // WMO Code Mapping
    const weatherCodes: { [key: number]: { description: string; icon: string } } = {
      0: { description: 'Klar', icon: '☀️' },
      1: { description: 'Überwiegend klar', icon: '🌤️' },
      2: { description: 'Teilweise bewölkt', icon: '⛅' },
      3: { description: 'Bewölkt', icon: '☁️' },
      45: { description: 'Nebel', icon: '🌫️' },
      48: { description: 'Gefrierender Nebel', icon: '🌫️' },
      51: { description: 'Leichter Nieselregen', icon: '🌦️' },
      53: { description: 'Nieselregen', icon: '🌦️' },
      55: { description: 'Starker Nieselregen', icon: '🌧️' },
      61: { description: 'Leichter Regen', icon: '🌧️' },
      63: { description: 'Regen', icon: '🌧️' },
      65: { description: 'Starker Regen', icon: '⛈️' },
      71: { description: 'Leichter Schneefall', icon: '🌨️' },
      73: { description: 'Schneefall', icon: '🌨️' },
      75: { description: 'Starker Schneefall', icon: '❄️' },
      80: { description: 'Regenschauer', icon: '🌦️' },
      81: { description: 'Kräftiger Regenschauer', icon: '⛈️' },
      82: { description: 'Heftiger Regenschauer', icon: '⛈️' },
      95: { description: 'Gewitter', icon: '⛈️' },
      96: { description: 'Gewitter mit Hagel', icon: '⛈️' },
      99: { description: 'Schweres Gewitter mit Hagel', icon: '⛈️' }
    };

    return weatherCodes[code] || { description: 'Unbekannt', icon: '🌡️' };
  }

  /**
   * Berechnet Mondphase (ohne externe API!)
   */
  private calculateMoonPhase(date: Date): { phase: string; emoji: string } {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Vereinfachte Mondphasen-Berechnung
    let c = 0;
    let e = 0;
    let jd = 0;
    let b = 0;

    if (month < 3) {
      const yearTemp = year - 1;
      const monthTemp = month + 12;
      c = yearTemp / 100;
      e = 2 - c + (c / 4);
      jd = (365.25 * (yearTemp + 4716)) + (30.6001 * (monthTemp + 1)) + day + e - 1524.5;
    } else {
      c = year / 100;
      e = 2 - c + (c / 4);
      jd = (365.25 * (year + 4716)) + (30.6001 * (month + 1)) + day + e - 1524.5;
    }

    const daysSinceNew = jd - 2451549.5;
    const newMoons = daysSinceNew / 29.53;
    const phase = (newMoons - Math.floor(newMoons)) * 29.53;

    // Mondphasen zuordnen
    if (phase < 1.84566) return { phase: 'Neumond', emoji: '🌑' };
    if (phase < 5.53699) return { phase: 'Zunehmende Sichel', emoji: '🌒' };
    if (phase < 9.22831) return { phase: 'Erstes Viertel', emoji: '🌓' };
    if (phase < 12.91963) return { phase: 'Zunehmender Mond', emoji: '🌔' };
    if (phase < 16.61096) return { phase: 'Vollmond', emoji: '🌕' };
    if (phase < 20.30228) return { phase: 'Abnehmender Mond', emoji: '🌖' };
    if (phase < 23.99361) return { phase: 'Letztes Viertel', emoji: '🌗' };
    if (phase < 27.68493) return { phase: 'Abnehmende Sichel', emoji: '🌘' };
    return { phase: 'Neumond', emoji: '🌑' };
  }

  /**
   * Prüft ob Cache noch gültig ist
   */
  private isCacheValid(timestamp: number): boolean {
    return (Date.now() - timestamp) < this.CACHE_DURATION_MS;
  }

  /**
   * Berechnet Cache-Alter in Minuten
   */
  private getCacheAge(timestamp: number): number {
    return Math.round((Date.now() - timestamp) / 1000 / 60);
  }

  /**
   * Konvertiert Windrichtung (Grad) zu Kompass-Richtung
   */
  getWindDirection(degrees: number): string {
    const directions = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  // === Cache Management (localStorage) ===

  private getCacheFromStorage(key: string): CachedWeather | null {
    try {
      const stored = localStorage.getItem(this.CACHE_KEY_PREFIX + key);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveCacheToStorage(key: string, cached: CachedWeather): void {
    try {
      localStorage.setItem(this.CACHE_KEY_PREFIX + key, JSON.stringify(cached));
    } catch (error) {
      console.warn('⚠️ Konnte Wetter-Cache nicht speichern:', error);
    }
  }

  private loadCacheFromStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(this.CACHE_KEY_PREFIX));
      keys.forEach(storageKey => {
        const cacheKey = storageKey.replace(this.CACHE_KEY_PREFIX, '');
        const cached = this.getCacheFromStorage(cacheKey);
        if (cached && this.isCacheValid(cached.timestamp)) {
          this.memoryCache.set(cacheKey, cached);
        }
      });
      console.log(`✅ ${keys.length} Wetter-Caches aus localStorage geladen`);
    } catch {
      console.warn('⚠️ Konnte Cache nicht laden');
    }
  }

  /**
   * Löscht alle abgelaufenen Caches (für Performance)
   */
  clearExpiredCache(): void {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.CACHE_KEY_PREFIX));
    let cleared = 0;
    
    keys.forEach(storageKey => {
      const cacheKey = storageKey.replace(this.CACHE_KEY_PREFIX, '');
      const cached = this.getCacheFromStorage(cacheKey);
      if (!cached || !this.isCacheValid(cached.timestamp)) {
        localStorage.removeItem(storageKey);
        this.memoryCache.delete(cacheKey);
        cleared++;
      }
    });

    if (cleared > 0) {
      console.log(`🗑️ ${cleared} abgelaufene Wetter-Caches gelöscht`);
    }
  }
}
