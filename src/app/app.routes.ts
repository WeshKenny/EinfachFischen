import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { LakeDetail } from './lake-detail/lake-detail';
import { Contact } from './contact/contact';
import { Lakes } from './lakes/lakes';
import { Patents } from './patents/patents';

export const routes: Routes = [
  { path: '', component: Home },                    // Default route (home page)
  { path: 'seen', component: Lakes },               // /seen route
  { path: 'lakes', redirectTo: 'seen', pathMatch: 'full' },
  { path: 'about', component: About },              // /about route
  { path: 'contact', component: Contact },          // /contact route
  { path: 'patente', component: Patents },          // /patente route - Fischereipatente pro Kanton
  { path: 'lake/:id', component: LakeDetail },      // /lake/:id route für See-Details
  { path: '**', redirectTo: '' }                    // Redirect any unknown route to home
];
