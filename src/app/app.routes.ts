import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { LakeDetail } from './lake-detail/lake-detail';
import { Contact } from './contact/contact';
import { Lakes } from './lakes/lakes';

export const routes: Routes = [
  { path: '', component: Home },                    // Default route (home page)
  { path: 'lakes', component: Lakes },              // /lakes route
  { path: 'about', component: About },              // /about route
  { path: 'contact', component: Contact },          // /contact route
  { path: 'lake/:id', component: LakeDetail },      // /lake/:id route für See-Details
  { path: '**', redirectTo: '' }                    // Redirect any unknown route to home
];
