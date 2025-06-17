import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from 'src/app/interfaces/location.interface';
import { IonicModule } from '@ionic/angular';
import { RatingBadgeComponent } from '../rating-badge/rating-badge.component';
import { addIcons } from 'ionicons';
import { location, trashOutline } from 'ionicons/icons';
@Component({
  selector: 'app-comment-card',
  standalone: true,
  templateUrl: './comment-card.component.html',
  styleUrls: ['./comment-card.component.scss'],
  imports: [IonicModule, RatingBadgeComponent, CommonModule]
})
export class CommentCardComponent {
  @Input() review!: Review;
  @Input() isLoggedIn: boolean = false;
  @Output() deleteReview = new EventEmitter<string>();

  constructor() { 
    addIcons({location, trashOutline});
  }

  get formattedDate(): string {
    const now = new Date();
    const created = new Date(this.review.createdOn);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);
  
    if (diff < 60) return 'hace unos segundos';
    if (diff < 120) return 'hace 1 minuto';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} minutos`;
    if (diff < 7200) return 'hace 1 hora';
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} horas`;
    if (diff < 172800) return 'hace 1 día';
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`;
    if (diff < 2419200) return `hace ${Math.floor(diff / 604800)} semanas`;
    if (diff < 29030400) return `hace ${Math.floor(diff / 2592000)} meses`;
  
    return `hace ${Math.floor(diff / 31536000)} años`;
  }
  

  get googleMapsLink(): string {
    return `https://www.google.com/maps?q=${this.review.coordinates[0]},${this.review.coordinates[1]}`;
  }


}
