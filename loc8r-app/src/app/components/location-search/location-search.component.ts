import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import {
  ViewWillEnter,
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
  IonGrid,
  IonCol,
  IonRow,
  IonSpinner,
  IonAccordionGroup,
  IonAccordion,
} from '@ionic/angular/standalone';
import { LocationService } from 'src/app/services/location.service';
import { PaginatedResults } from 'src/app/interfaces/location.interface';
import { LocationModel } from 'src/app/models/location.model';
import { LocationCardComponent } from '../location-card/location-card.component';
import { LocationSearchFiltersComponent } from '../location-search-filters/location-search-filters.component';
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
    LocationCardComponent,
    IonGrid,
    IonCol,
    IonRow,
    IonSpinner,
    LocationSearchFiltersComponent,
    IonAccordionGroup,
    IonAccordion,
]
})
export class LocationSearchComponent implements OnInit, ViewWillEnter{

  // Filtros
  query: string = '';
  searchBy: 'name' | 'date' | 'coordinates' = 'name';
  sortBy: 'name' | 'rating' | 'date' = 'name';
  order: 'asc' | 'desc' = 'asc';
  pageSize: number = 6;
  offset: number = 0;

  // Resultados
  results: LocationModel[] = [];
  totalResults: number = 0;
  currentPage: number = 1;

  // Estado
  isLoading: boolean = false;

  constructor(
    private locationService: LocationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchLocations();
  }

  ionViewWillEnter(): void {
    this.searchLocations();
  }

  searchLocations(): void {
    this.isLoading = true;
    // console.log('Resultados pre searchLocations():', this.results.length)

    this.locationService
      .getLocations(
        this.query,
        this.pageSize,
        this.offset,
        this.searchBy,
        this.sortBy,
        this.order
      )
      .subscribe({
        next: (response: PaginatedResults<LocationModel>) => {
          this.results = response.results;
          this.totalResults = response.total;
          this.isLoading = false;

          // debug
          // console.log('Resultados post searchLocations():', this.results.length)
          // console.log('Total locations:', this.totalResults)

        },
        error: (err) => {
          console.error('Error en la búsqueda de locations:', err);
          this.isLoading = false;
        }
      });
  }

  onSearch(filters: {
    query: string;
    searchBy: 'name' | 'date' | 'coordinates';
    sortBy: 'name' | 'rating' | 'date';
    order: 'asc' | 'desc';
    pageSize: number;
  }): void {
    // Guardar filtros recibidos
    this.query = filters.query;
    this.searchBy = filters.searchBy;
    this.sortBy = filters.sortBy;
    this.order = filters.order;
    this.pageSize = filters.pageSize;

    // Reset de paginación y cálculo de offset inicial
    this.currentPage = 1;
    this.offset = 0;

    // console.log('Filtros recibidos:', filters);

    this.searchLocations();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset = (this.currentPage - 1) * this.pageSize;
      this.searchLocations();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextPage(): void {
    const maxPages = Math.ceil(this.totalResults / this.pageSize);
    if (this.currentPage < maxPages) {
      this.currentPage++;
      this.offset = (this.currentPage - 1) * this.pageSize;
      this.searchLocations();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToLocation(loc: LocationModel): void {
    const url = loc.detailUrl || '/locations/' + loc.id;
    this.router.navigateByUrl(url);
  }

  get math() {
    return Math;
  }
}