import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReportIssue {
  lakeName: string;
  lakeId: string;
  category: 'Patent-Informationen veraltet' | 'Regeländerung' | 'Falsche Daten' | 'Sonstiges:';
  description: string;
  email?: string;
  timestamp: string;
  userAgent: string;
}

@Component({
  selector: 'app-report-issue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-issue.component.html',
  styleUrl: './report-issue.component.css'
})
export class ReportIssueComponent {
  @Input() lakeName: string = '';
  @Input() lakeId: string = '';
  @Output() close = new EventEmitter<void>();

  isOpen = false;
  isSubmitting = false;
  isSuccess = false;
  errorMessage = '';

  // Form Model
  reportData = {
    category: 'Patent-Informationen veraltet' as const,
    description: '',
    email: ''
  };

  // Rate Limiting (client-side)
  private readonly COOLDOWN_KEY = 'lastReportTime';
  private readonly COOLDOWN_MINUTES = 2; // 2 Minuten Wartezeit

  categories = [
    { value: 'Patent-Informationen veraltet', label: '📜 Patent-Informationen veraltet' },
    { value: 'Regeländerung', label: '⚖️ Regeländerung' },
    { value: 'Falsche Daten', label: '📊 Falsche Daten' },
    { value: 'Sonstiges:', label: '❓ Sonstiges' }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  open() {
    console.log('🚨 Report Issue Modal öffnen...');
    
    // Check Rate Limit nur beim Submit, nicht beim Öffnen
    this.isOpen = true;
    this.resetForm();
    this.cdr.detectChanges(); // Force UI update
    console.log('✅ Modal isOpen:', this.isOpen);
  }

  closeModal() {
    this.isOpen = false;
    this.resetForm();
    this.cdr.detectChanges(); // Force UI update
    this.close.emit();
  }

  async submitReport() {
    if (!this.reportData.description.trim()) {
      this.errorMessage = 'Bitte beschreiben Sie das Problem.';
      return;
    }

    // Rate Limiting Check
    if (!this.canSubmit()) {
      this.errorMessage = `⏱️ Sie haben kürzlich bereits eine Meldung gesendet. Bitte warten Sie ${this.COOLDOWN_MINUTES} Minuten.`;
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const report: ReportIssue = {
      lakeName: this.lakeName,
      lakeId: this.lakeId,
      category: this.reportData.category,
      description: this.reportData.description,
      email: this.reportData.email || undefined,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    try {
      // Google Forms Submission aktiviert!
      console.log('📧 Sende Meldung an Google Forms:', report);
      
      // Option 1: Google Forms (AKTIVIERT!)
      await this.submitToGoogleForms(report);
      
      // Option 2: Formspree (Alternative)
      // await this.submitToFormspree(report);
      
      this.isSuccess = true;
      this.setLastReportTime();
      
      setTimeout(() => {
        this.closeModal();
      }, 2000); // 2 Sekunden Success-Meldung
      
    } catch (error) {
      console.error('Fehler beim Senden:', error);
      this.errorMessage = '❌ Fehler beim Senden. Bitte versuchen Sie es später erneut.';
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Google Forms Submission (EMPFOHLEN!)
   * 1. Erstelle Google Form mit Feldern
   * 2. Hole Form-URL mit "Prefill Link"
   * 3. Extrahiere entry IDs aus URL
   */
  private async submitToGoogleForms(report: ReportIssue): Promise<void> {
    // Deine Google Form URL mit Entry IDs
    const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSeBIgD7gpSKQl81HAHDUWegXnyLa7uV1XD0QOV61pf5c7pCgw/formResponse';
    
    const formData = new URLSearchParams({
      'entry.938139659': report.lakeName,      // See-Name
      'entry.1759447220': report.category,     // Kategorie
      'entry.1188145912': report.description,  // Beschreibung
      'entry.689485063': report.email || ''    // E-Mail (leer wenn nicht angegeben)
    });

    // CORS-Trick: Nutze iframe statt fetch (Google Forms blockt CORS)
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `${GOOGLE_FORM_ACTION}?${formData.toString()}`;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        resolve();
      }, 1000);
    });
  }

  /**
   * Formspree Alternative (Kostenpflichtig ab 50 Submissions/Monat)
   */
  private async submitToFormspree(report: ReportIssue): Promise<void> {
    const FORMSPREE_URL = 'https://formspree.io/f/DEINE_FORM_ID';
    
    const response = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });

    if (!response.ok) {
      throw new Error('Formspree submission failed');
    }
  }

  // Rate Limiting Helpers
  private canSubmit(): boolean {
    const lastTime = localStorage.getItem(this.COOLDOWN_KEY);
    if (!lastTime) return true;

    const lastDate = new Date(lastTime);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastDate.getTime()) / 1000 / 60;

    return diffMinutes >= this.COOLDOWN_MINUTES;
  }

  private setLastReportTime(): void {
    localStorage.setItem(this.COOLDOWN_KEY, new Date().toISOString());
  }

  private resetForm(): void {
    this.reportData = {
      category: 'Patent-Informationen veraltet',
      description: '',
      email: ''
    };
    this.isSuccess = false;
    this.errorMessage = '';
  }
}
