import { Routes } from '@angular/router';
import { TabsComponent } from './components/tabs/tabs.component';
import { GuestGuard } from './guards/guest.guard';
export const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./components/landing-page/landing-page.component').then((m) => m.LandingPageComponent),
      },
      {
        path: 'home/login',
        loadComponent: () => import('./components/login-page/login-page.component').then(m => m.LoginPageComponent),
      },
      {
        path: 'home/register',
        loadComponent: () => import('./components/login-page/login-page.component').then(m => m.LoginPageComponent),
      },
      {
        path: 'locations',
        loadComponent: () => import('./components/location-search/location-search.component').then(m => m.LocationSearchComponent)
      },      
      {
        path: 'locations/:id',
        loadComponent: () => import('./components/location-details/location-details.component').then(m => m.LocationDetailsComponent)
      },
      {
        path: 'locations-add',
        loadComponent: () => import('./components/location-form/location-form.component').then(m => m.LocationFormComponent)
      },
      {
        path: 'fsq-locations',
        loadComponent: () => import('./components/fsq-import/fsq-import.component').then(m => m.FsqImportComponent)
      }, 
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
      }, 
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
