import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LakeService, Lake } from '../services/lake.service';
import { UiPreferencesService } from '../services/ui-preferences.service';
import { getCantonImageAsset } from '../canton-image-map';

interface CantonPatent {
  canton: string;
  image: string;
  lakeCount: number;
}

@Component({
  selector: 'app-patents',
  imports: [CommonModule],
  templateUrl: './patents.html',
  styleUrl: './patents.css'
})
export class Patents implements OnInit {
  private lakes: Lake[] = [];

  constructor(
    private lakeService: LakeService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public prefs: UiPreferencesService
  ) {}

  async ngOnInit() {
    this.lakes = await this.lakeService.getLakes();
    this.cdr.detectChanges();
  }

  get patents(): CantonPatent[] {
    const counts = new Map<string, number>();

    for (const lake of this.lakes) {
      for (const canton of this.extractCantons(lake.cantons)) {
        counts.set(canton, (counts.get(canton) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .map(([canton, lakeCount]) => ({
        canton,
        lakeCount,
        image: getCantonImageAsset(canton)
      }))
      .sort((a, b) =>
        this.prefs.localizeCantonName(a.canton).localeCompare(this.prefs.localizeCantonName(b.canton), this.prefs.language())
      );
  }

  showOnMap(canton: string): void {
    this.router.navigate(['/'], { queryParams: { canton } });
  }

  private extractCantons(rawCantons: string): string[] {
    return rawCantons
      .split(',')
      .map(canton => canton.trim())
      .filter(Boolean);
  }
}
