import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import {
  IonList,
  IonButton,
  IonHeader,
  IonToolbar,
  IonCardContent,
  IonCardTitle,
  IonCardHeader,
  IonTitle,
  IonCard,
  IonContent,
  IonSearchbar,
  IonSelectOption,
  IonSelect,
  IonLabel,
  IonItem,

} from '@ionic/angular/standalone';
import { LocationService } from 'src/app/services/location.service';
import { PaginatedResults } from 'src/app/interfaces/location.interface';
import { LocationModel } from 'src/app/models/location.model';
import { LocationCardComponent } from '../location-card/location-card.component';

@Component({
  selector: 'app-location-search',
  standalone: true,
  templateUrl: './location-search.component.html',
  styleUrls: ['./location-search.component.scss'],
  imports: [
    HeaderComponent,
    IonList,
    CommonModule,
    IonButton,
    IonHeader,
    IonToolbar,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonTitle,
    IonCard,
    IonContent,
    IonSearchbar,
    IonSelectOption,
    IonSelect,
    IonLabel,
    IonItem,
    LocationCardComponent
]
})
export class LocationSearchComponent implements OnInit {
  ngOnInit(): void {
    this.searchLocations();
  }

  query: string = '';
  searchBy: 'name' | 'date' | 'coordinates' = 'name';
  sortBy: 'name' | 'rating' | 'date' = 'rating';
  order: 'asc' | 'desc' = 'desc';

  pageSize: number = 10;
  offset: number = 0;
  totalResults: number = 0;
  currentPage: number = 1;

  searchByOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'date', label: 'Fecha' },
    { value: 'coordinates', label: 'Coordenadas' }
  ];

  sortByOptions = [
    { value: 'rating', label: 'Valoración' },
    { value: 'name', label: 'Nombre' },
    { value: 'date', label: 'Fecha' }
  ];

  orderOptions = [
    { value: 'desc', label: 'Descendente' },
    { value: 'asc', label: 'Ascendente' }
  ];

  results: LocationModel[] = [];

  constructor(private locationService: LocationService, private router: Router) {}

  searchLocations(): void {
    const offset = (this.currentPage - 1) * this.pageSize;

    this.locationService
      .getLocations(this.query, this.pageSize, offset, this.searchBy, this.sortBy, this.order)
      .subscribe({
        next: (response: PaginatedResults<LocationModel>) => {
          this.results = response.results;
          this.totalResults = response.total;

          console.log('Resultados obtenidos:', this.results);
          console.log(`Página ${this.currentPage} de ${Math.ceil(this.totalResults / this.pageSize)}`);
        },
        error: (err) => {
          console.error('Error en la búsqueda de locations:', err);
        }
      });
  }

  executeSearch() {
    this.offset = 0;
    this.currentPage = 1;
    this.searchLocations();
  }

  onInputKeyup(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.executeSearch();
    }
  }

  prevPage() {
    if (this.offset >= this.pageSize) {
      this.offset -= this.pageSize;
      this.currentPage--;
      this.searchLocations();
    }
  }

  nextPage() {
    if ((this.offset + this.pageSize) < this.totalResults) {
      this.offset += this.pageSize;
      this.currentPage++;
      this.searchLocations();
    }
  }

  goToLocation(loc: LocationModel) {
    const url = loc.detailUrl || '/locations/' + loc.id;
    this.router.navigateByUrl(url);
  }

  get math() {
    return Math;
  }
}