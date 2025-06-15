import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LocationService } from '../../services/location.service';
import { LocationModel } from '../../models/location.model';
import { PaginatedResults } from '../../interfaces/location.interface';

import { LocationCardComponent } from '../location-card/location-card.component';

import {
  IonContent,
  IonList,
  
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonList,
    LocationCardComponent
  ],
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.css']
})
export class LocationListComponent {
  locations: LocationModel[] = [];
  total = 0;
  limit = 10;
  offset = 0;

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.locationService.getLocations('', this.limit, this.offset).subscribe({
      next: (response: PaginatedResults<LocationModel>) => {
        console.log('Response from API:', response);
        this.total = response.total;
        this.locations = response.results ?? [];
        console.log('Loaded locations:', this.locations);
        this.locations.forEach(loc => {
          console.log(`Location: ${loc.name}, Image URL: ${loc.imageUrl}`);
        });
      },
      error: (err) => {
        console.error('Error loading locations:', err);
      }
    });
  }
}
