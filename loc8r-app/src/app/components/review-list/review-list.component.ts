import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../interfaces/location.interface';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})
export class ReviewListComponent {
  reviews: Review[] = [];

  constructor(
    private route: ActivatedRoute,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    const locationId = this.route.snapshot.paramMap.get('id');
    if (locationId) {
      this.reviewService.getReviews(locationId).subscribe({
        next: (response) => {
          this.reviews = response;
        },
        error: (err) => {
          console.error('Error fetching reviews:', err);
        }
      });
    }
  }
}
