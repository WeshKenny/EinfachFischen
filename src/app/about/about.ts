import { Component } from '@angular/core';
import { UiPreferencesService } from '../services/ui-preferences.service';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  constructor(public prefs: UiPreferencesService) {}
}
