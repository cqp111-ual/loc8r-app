import { Component, Input, OnChanges } from '@angular/core';
import { LocationModel } from '../../models/location.model';
import { addIcons } from 'ionicons';
import { locationOutline } from 'ionicons/icons';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon
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
    IonIcon
  ],
})
export class LocationCardComponent implements OnChanges {
  @Input() location!: LocationModel;

  ratingDecimal: string = '0.0';
  ratingClass: string = 'rating-zero';
  ratingMessage: string = '';
  reviewsCount: number = 0;
  geolocationUrl: string = '';

  constructor() {
    // Necesario para que <ion-icon name="location-outline"> funcione
    addIcons({ locationOutline });
  }

  ngOnChanges() {
    const rating = this.location.rating ?? 0;
    this.ratingDecimal = rating.toFixed(1);

    if (rating === 0) {
      this.ratingClass = 'rating-zero';
      this.ratingMessage = 'Sin valoración';
    } else if (rating < 2.5) {
      this.ratingClass = 'rating-bad';
      this.ratingMessage = 'Malo';
    } else if (rating < 4) {
      this.ratingClass = 'rating-average';
      this.ratingMessage = 'Regular';
    } else {
      this.ratingClass = 'rating-good';
      this.ratingMessage = 'Excelente';
    }

    this.reviewsCount = this.location.numReviews ?? 0;
    this.geolocationUrl = `https://www.google.com/maps?q=${this.location.coordinates[0]},${this.location.coordinates[1]}`;
  }

  getImageUrl(imageId: string | null): string {
    if (imageId) {
      // Aquí puedes poner la URL real que genera la imagen a partir del imageId
      return `https://mi-servidor-de-imagenes.com/images/${imageId}.jpg`;
    }
    return 'https://ionicframework.com/docs/img/demos/card-media.png';
  }
}
