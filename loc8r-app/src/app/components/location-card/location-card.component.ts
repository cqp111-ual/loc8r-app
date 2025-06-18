import { Component, Input, OnChanges } from '@angular/core';
import { LocationModel } from '../../models/location.model';
import { addIcons } from 'ionicons';
import { location, calendarOutline } from 'ionicons/icons';
import { RatingBadgeComponent } from '../rating-badge/rating-badge.component';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-location-card',
  standalone: true,
  templateUrl: './location-card.component.html',
  styleUrls: ['./location-card.component.scss'],
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonIcon,
    RatingBadgeComponent
  ],
})
export class LocationCardComponent implements OnChanges {
  @Input() location!: LocationModel;

  ratingMessage: string = '';
  geolocationUrl: string = '';

  constructor() {
    addIcons({ location, calendarOutline });
  }

  ngOnChanges() {
    const rating = this.location.rating ?? 0;

    if (rating === 0) {
      this.ratingMessage = 'Sin valoración';
    } else if (rating < 2.5) {
      this.ratingMessage = 'Malo';
    } else if (rating < 4) {
      this.ratingMessage = 'Regular';
    } else {
      this.ratingMessage = 'Excelente';
    }

    this.geolocationUrl = `https://www.google.com/maps?q=${this.location.coordinates[0]},${this.location.coordinates[1]}`;
  }
}
