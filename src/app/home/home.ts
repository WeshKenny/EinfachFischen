import { Component } from '@angular/core';
import { Map } from '../map/map';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Map],    // ← Import the Map component
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {

}
