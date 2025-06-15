import { Component, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-badge',
  standalone: true,
  templateUrl: './rating-badge.component.html',
  styleUrls: ['./rating-badge.component.scss'],
  imports: [CommonModule]
})
export class RatingBadgeComponent implements OnChanges {
  @Input() rating: number = 0;
  @Input() size: 'xx-small' | 'x-small' |'small' | 'medium' | 'large' = 'small';

  ratingDecimal: string = '0.00';
  ratingClass: string = 'rating-zero';

  ngOnChanges() {
    this.updateRating();
  }

  private updateRating() {
    const rating = this.rating ?? 0;
    this.ratingDecimal = rating.toFixed(2);

    const score = Math.floor(rating * 100);

    if (score === 0) {
      this.ratingClass = 'rating-zero';
    } else if (score < 250) {
      this.ratingClass = 'rating-bad';
    } else if (score < 400) {
      this.ratingClass = 'rating-average';
    } else {
      this.ratingClass = 'rating-good';
    }
  }
}
