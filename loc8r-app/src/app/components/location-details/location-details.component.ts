// location-details.component.ts
import { Input, AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import { closeOutline, scanCircleOutline } from 'ionicons/icons';
import { LocationService } from '../../services/location.service';
import { ReviewService } from '../../services/review.service';
import { LocationModel } from '../../models/location.model';
import { environment } from 'src/environments/environment';
import { PaginatedResults, Review } from 'src/app/interfaces/location.interface';
import { ReviewCardComponent } from '../../components/review-card/review-card.component';

import {
  IonLoading,
  IonToast,
  IonSpinner,
  IonItem,
  IonIcon,
  IonButton,
  IonContent,
  ModalController,
  IonInfiniteScrollContent,
  IonInfiniteScroll,
  IonImg,
  IonLabel
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import { ImageVisualizerComponent } from '../image-visualizer/image-visualizer.component';

@Component({
  selector: 'app-location-component',
  standalone: true,
  imports: [
    IonLoading,
    IonToast,
    IonSpinner,
    IonItem,
    IonLabel,
    IonContent,
    IonButton,
    CommonModule,
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    IonImg,        
    IonIcon,
    ImageVisualizerComponent,
    ReviewCardComponent,
  ],
  templateUrl: './location-details.component.html',
  styleUrls: ['./location-details.component.scss'],
})
export class LocationDetailsComponent implements OnInit, AfterViewInit {

  @ViewChild('content', { static: true }) content!: IonContent;

  isLoading = false;
  showError = false;

  location!: LocationModel;
  ratingDecimal: string = '0.0';
  ratingClass: string = 'rating-zero';
  ratingMessage: string = '';
  googleMapsEmbedUrl!: SafeResourceUrl;

  reviews: Review[] = [];
  page = 0;
  limit = 10;
  reviewsLoading = false;
  reviewsFinished = false;

  showImage: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private locationService: LocationService,
    private sanitizer: DomSanitizer,
    private reviewService: ReviewService,
    private modalCtrl: ModalController
  ) {
    addIcons({ closeOutline, scanCircleOutline });
  }

  ngOnInit() {
    const locationId = this.route.snapshot.paramMap.get('id');
    if (locationId) {
      this.isLoading = true;  // activamos loading al empezar
      this.locationService.getLocationById(locationId).subscribe({
        next: loc => {
          this.location = loc;
          this.setRating();
          const rawUrl = this.getGoogleMapsEmbed(loc.coordinates[0], loc.coordinates[1]);
          this.googleMapsEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
          this.isLoading = false;  // desactivamos loading al acabar bien
        },
        error: err => {
          console.error('Error cargando location', err);
          this.showError = true;  // mostramos error
          this.isLoading = false; // desactivamos loading aunque haya error
        }
      });

      this.loadReviews();
    } else {
      this.showError = true;
    }
  }

  ngAfterViewInit() {
    this.content.ionScroll.subscribe((event) => {
      const scrollTop = event.detail.scrollTop;
      const image = document.querySelector('.header-image') as HTMLElement;

      if (image) {
        if (scrollTop < 0) {
          // Zoom cuando scroll arriba del todo
          const maxScale = 1.5;
          const scale = Math.min(maxScale, 1 + Math.abs(scrollTop) / 300);
          image.style.transform = `scale(${scale})`;
        } else {
          // Parallax scroll hacia arriba
          const maxTranslate = 80;
          const translateY = Math.min(maxTranslate, scrollTop * 0.4);
          image.style.transform = `translateY(${translateY}px)`;
        }
      }
    });
  }

  async openImageModal() {
    const modal = await this.modalCtrl.create({
      component: ImageVisualizerComponent,
      componentProps: { imageUrl: this.location.imageUrl },
      cssClass: 'simple-image-modal',
      showBackdrop: true,
      backdropDismiss: false,
    });
    await modal.present();
  }

  setRating() {
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
  }

  getGoogleMapsEmbed(lat: number, lng: number): string {
    const apiKey = environment.googleMapsApiKey;
    return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=16`;
  }

  loadReviews() {
    if (this.reviewsLoading || this.reviewsFinished) {
      console.log('[loadReviews] Skip: loading=', this.reviewsLoading, ' finished=', this.reviewsFinished);
      return;
    }
  
    console.log(this.location.id);
    console.log('[loadReviews] Fetching page', this.page);
    this.reviewsLoading = true;
  
    this.reviewService.getReviews(this.location.id, this.page, this.limit).subscribe({
      next: paginated => {
        console.log('[loadReviews] Received reviews:', paginated.results.length);
        this.reviews.push(...paginated.results);
        this.page++;
        this.reviewsLoading = false;
  
        if (paginated.results.length < this.limit) {
          console.log('[loadReviews] No more reviews to load. Marking as finished.');
          this.reviewsFinished = true;
        }
      },
      error: err => {
        console.error('[loadReviews] Error:', err);
        this.reviewsLoading = false;
      }
    });
  
    console.log(this.reviews);
  }
  
  loadMoreReviews(event: any) {
    setTimeout(() => {
      this.loadReviews();
      event.target.complete();
    }, 1500);  // pequeño delay para que no vaya demasiado rápido
  }

}
