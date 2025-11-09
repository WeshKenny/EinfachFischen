import { Injectable, signal } from '@angular/core';

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
}

@Injectable({
  providedIn: 'root'
})
export class LakeService {
  // Signal für den ausgewählten See - für reaktive Updates
  private selectedLakeSignal = signal<Lake | null>(null);
  public selectedLake = this.selectedLakeSignal.asReadonly();

  // Alle Seen-Daten zentral verwaltet
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

  constructor() {}

  /**
   * Gibt alle Seen zurück
   */
  getLakes(): Lake[] {
    return this.lakes;
  }

  /**
   * Gibt alle Seen zurück, bei denen man gratis fischen kann
   */
  getFreeFishingLakes(): Lake[] {
    return this.lakes.filter(lake => lake.freeFishing);
  }

  /**
   * Filtert Seen nach Kanton
   */
  getLakesByRegion(region: string): Lake[] {
    return this.lakes.filter(lake => 
      lake.cantons.toLowerCase().includes(region.toLowerCase())
    );
  }

  /**
   * Sucht einen See nach Namen
   */
  getLakeByName(name: string): Lake | undefined {
    return this.lakes.find(lake => 
      lake.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Filtert Seen nach bestimmter Fischart
   */
  getLakesByFishSpecies(species: string): Lake[] {
    return this.lakes.filter(lake =>
      lake.fishSpecies.some(fish => 
        fish.toLowerCase().includes(species.toLowerCase())
      )
    );
  }

  /**
   * Setzt den aktuell ausgewählten See
   */
  selectLake(lake: Lake | null): void {
    this.selectedLakeSignal.set(lake);
  }

  /**
   * Gibt die Anzahl aller Seen zurück
   */
  getTotalLakeCount(): number {
    return this.lakes.length;
  }

  /**
   * Gibt die Anzahl der patentfreien Seen zurück
   */
  getFreeFishingLakeCount(): number {
    return this.lakes.filter(lake => lake.freeFishing).length;
  }
}
