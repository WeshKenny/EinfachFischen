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
  // WICHTIG: Ersetze mit deinem OpenWeatherMap API Key
  // Hol dir einen kostenlosen Key: https://openweathermap.org/api
  private readonly API_KEY = 'DEIN_API_KEY_HIER'; // TODO: API Key eintragen!
  private readonly API_URL = 'https://api.openweathermap.org/data/2.5/weather';
  
  // Cache Konfiguration
  private readonly CACHE_DURATION_MS = 30 * 60 * 1000; // 30 Minuten
  private readonly CACHE_KEY_PREFIX = 'weather_';
  
  // In-Memory Cache (für schnelleren Zugriff)
  private memoryCache = new Map<string, CachedWeather>();

  constructor(private http: HttpClient) {
    this.loadCacheFromStorage();
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
   * Holt Wetterdaten von OpenWeatherMap API
   */
  private fetchWeatherFromAPI(lat: number, lon: number, cacheKey: string): Observable<WeatherData | null> {
    if (this.API_KEY === 'DEIN_API_KEY_HIER') {
      console.warn('⚠️ OpenWeatherMap API Key nicht konfiguriert!');
      return of(null);
    }

    const params = {
      lat: lat.toString(),
      lon: lon.toString(),
      units: 'metric',
      lang: 'de',
      appid: this.API_KEY
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
        console.log(`✅ Wetter erfolgreich geladen und gecacht`);
      }),
      catchError(error => {
        console.error('❌ Fehler beim Laden des Wetters:', error);
        return of(null);
      })
    );
  }

  /**
   * Parst OpenWeatherMap Response zu unserem WeatherData Format
   */
  private parseWeatherResponse(response: any): WeatherData {
    const moonPhase = this.calculateMoonPhase(new Date());
    
    return {
      temp: Math.round(response.main.temp),
      feelsLike: Math.round(response.main.feels_like),
      description: response.weather[0].description,
      icon: response.weather[0].icon,
      windSpeed: Math.round(response.wind.speed * 3.6), // m/s -> km/h
      windDeg: response.wind.deg,
      humidity: response.main.humidity,
      pressure: response.main.pressure,
      clouds: response.clouds.all,
      rainChance: response.rain?.['1h'] || 0,
      sunrise: response.sys.sunrise,
      sunset: response.sys.sunset,
      moonPhase: moonPhase.phase,
      moonPhaseEmoji: moonPhase.emoji
    };
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
