import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoordPickerComponent } from '../coord-picker/coord-picker.component';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';
import {
  IonRange,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonCheckbox,
} from '@ionic/angular/standalone';
@Component({
  selector: 'app-fsq-search-card',
  standalone: true,
  templateUrl: './fsq-search-card.component.html',
  styleUrls: ['./fsq-search-card.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    CoordPickerComponent,
    IonRange,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonCheckbox,
  ]
})
export class FsqSearchCardComponent {
  @Input() title = 'Filtros de Búsqueda';

  @Output() search = new EventEmitter<any>();

  constructor() {
    addIcons({ searchOutline });
  }

  filters = {
    query: { enabled: true, value: '' },
    coordinates: { enabled: false, value: null as { lat: number; lng: number } | null },
    radius: { enabled: false, value: 10 },
    sortBy: { enabled: false, value: 'relevance' }
  };

  onCoordinatesChanged(coords: { lat: number; lng: number }) {
    this.filters.coordinates.value = coords;
  }

  get isSearchDisabled(): boolean {
    return !Object.values(this.filters).some(f => f.enabled);
  }
  
  emitSearch() {
    const activeFilters = Object.entries(this.filters)
    .filter(([_, filter]) => filter.enabled)
    .reduce((acc, [key, filter]) => {
      acc[key] = filter.value;
      return acc;
    }, {} as Record<string, any>);

    console.log('Emitting search with filters:', activeFilters);
    this.search.emit(activeFilters);
  }
}