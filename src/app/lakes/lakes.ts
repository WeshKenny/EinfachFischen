import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LakeService, Lake } from '../services/lake.service';
import { UiPreferencesService } from '../services/ui-preferences.service';

@Component({
  selector: 'app-lakes',
  imports: [CommonModule, RouterLink],
  templateUrl: './lakes.html',
  styleUrl: './lakes.css'
})
export class Lakes implements OnInit {
  lakes: Lake[] = [];

  constructor(
    private lakeService: LakeService,
    private cdr: ChangeDetectorRef,
    public prefs: UiPreferencesService
  ) {}

  async ngOnInit() {
    const lakes = await this.lakeService.getLakes();
    this.lakes = [...lakes];
    this.cdr.detectChanges();
  }

  get sortedLakes(): Lake[] {
    return [...this.lakes].sort((a, b) =>
      this.prefs.localizeLakeName(a.name).localeCompare(this.prefs.localizeLakeName(b.name), this.prefs.language())
    );
  }
}
