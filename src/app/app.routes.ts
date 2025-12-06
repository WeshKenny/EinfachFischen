import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Details } from './details/details';
import { About } from './about/about';
import { LakeDetail } from './lake-detail/lake-detail';

export const routes: Routes = [
  { path: '', component: Home },                    // Default route (home page)
  { path: 'details', component: Details },          // /details route
  { path: 'about', component: About },              // /about route
  { path: 'lake/:id', component: LakeDetail },      // /lake/:id route für See-Details
  { path: '**', redirectTo: '' }                    // Redirect any unknown route to home
];
