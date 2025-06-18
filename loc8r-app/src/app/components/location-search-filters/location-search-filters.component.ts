import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';
import {
  IonSelect,
  IonSelectOption,
  IonButton,
  IonItem,
  IonInput,
  IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-location-search-filters',
  standalone: true,
  templateUrl: './location-search-filters.component.html',
  styleUrls: ['./location-search-filters.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonItem,
    IonInput,
    IonIcon
  ]
})
export class LocationSearchFiltersComponent {
  @Input() title = 'Filtros de búsqueda';

  query: string = '';
  searchBy: 'name' | 'coordinates' = 'name';
  sortBy: 'name' | 'rating' | 'date' = 'name';
  order: 'asc' | 'desc' = 'asc';

  pageSize: number = 6;

  @Output() search = new EventEmitter<{
    query: string;
    searchBy: 'name' | 'coordinates';
    sortBy: 'name' | 'rating' | 'date';
    order: 'asc' | 'desc';
    pageSize: number;
  }>();

  constructor() {
    addIcons({searchOutline});
  }

  emitSearch() {
    // console.log('emitSearch llamado');
    this.search.emit({
      query: this.query,
      searchBy: this.searchBy,
      sortBy: this.sortBy,
      order: this.order,
      pageSize: this.pageSize,
    });
  }
}