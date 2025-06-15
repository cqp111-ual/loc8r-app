import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { locationOutline } from 'ionicons/icons';

import {
  IonIcon,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-review-card',
  standalone: true,
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss'],
  imports: [
    IonIcon,
    DatePipe,
    IonCardContent,
    CommonModule,
    IonCard,
  ]
})
export class ReviewCardComponent {
  @Input() review!: {
    author: string;
    rating: number;
    reviewText: string;
    createdOn: string | Date;
    coordinates: [number, number];
  };

  ReviewCardComponent() {
    addIcons({ locationOutline });
  }

  hasCoordinates(): boolean {
    return !!(this.review.coordinates && this.review.coordinates.length === 2);
  }
  geolocationUrl(): string {
    if (!this.hasCoordinates()) return '';
    const [lat, lng] = this.review.coordinates!;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
}
