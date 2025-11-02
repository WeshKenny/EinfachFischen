import { Component, ViewChild, ElementRef } from '@angular/core';
import { Map } from '../map/map';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Map, CommonModule],    // ← Import the Map component
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  loadError = false;
  @ViewChild('mapSection') mapSection!: ElementRef;

  scrollToMap() {
    this.mapSection.nativeElement.scrollIntoView({ 
      behavior: 'smooth'
    });
  }
  // optional: falls du einen Handler statt direkter Zuweisung möchtest
  onMapLoadError() {
    this.loadError = true;
  }
}
