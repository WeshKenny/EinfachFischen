import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiPreferencesService } from '../services/ui-preferences.service';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  formData = {
    name: '',
    email: '',
    message: ''
  };

  constructor(public prefs: UiPreferencesService) {}

  submitContactForm() {
    const subject = encodeURIComponent(`Kontakt EinfachFischen${this.formData.name ? ` - ${this.formData.name}` : ''}`);
    const body = encodeURIComponent(
      `Name: ${this.formData.name || '-'}\nE-Mail: ${this.formData.email || '-'}\n\nNachricht:\n${this.formData.message}`
    );

    window.location.href = `mailto:info@einfachfischen.ch?subject=${subject}&body=${body}`;
  }
}
