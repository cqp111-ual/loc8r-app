import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import { closeOutline, scanCircleOutline } from 'ionicons/icons';
import { LocationService } from '../../services/location.service';
import { ReviewService } from '../../services/review.service';
import { LocationModel } from '../../models/location.model';
import { Review } from 'src/app/interfaces/location.interface';
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
  selector: 'app-location-details-2-component',
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
  templateUrl: './location-details-2.component.html',
  styleUrls: ['./location-details-2.component.scss'],
})
export class LocationDetails2Component implements OnInit, AfterViewInit {

  @ViewChild('content', { static: true }) content!: IonContent;

  location!: LocationModel;

  isLoading = false;
  showError = false;

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
    private router: Router,
    private sanitizer: DomSanitizer,
    private locationService: LocationService,
    private reviewService: ReviewService,
    private modalCtrl: ModalController
  ) {
    addIcons({ closeOutline, scanCircleOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Componente cargado con ruta:', this.router.url);
    if (id) {
      this.isLoading = true;
      this.locationService.getLocationById(id).subscribe({
        next: (loc) => {
          this.location = loc;
          this.initLocationDetails();
          this.loadReviews();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.showError = true;
        }
      });
    } else {
      this.showError = true;
    }
  }
  

  loadLocation(id: string) {
    this.isLoading = true;
    this.locationService.getLocationById(id).subscribe({
      next: loc => {
        this.location = loc;
        this.initLocationDetails();
        this.loadReviews();
      },
      error: err => {
        console.error('Error cargando location', err);
        this.showError = true;
        this.isLoading = false;
      }
    });
  }

  initLocationDetails() {
    this.setRating();
    const rawUrl = this.getGoogleMapsEmbed(this.location.coordinates[0], this.location.coordinates[1]);
    this.googleMapsEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
    this.isLoading = false;
    this.showError = false;
  }

  resetReviews() {
    this.page = 0;
    this.reviews = [];
    this.reviewsFinished = false;
  }

  ngAfterViewInit() {
    if (!this.content) return;
    this.content.ionScroll.subscribe((event) => {
      const scrollTop = event.detail.scrollTop;
      const image = document.querySelector('.header-image') as HTMLElement;

      if (image) {
        if (scrollTop < 0) {
          const maxScale = 1.5;
          const scale = Math.min(maxScale, 1 + Math.abs(scrollTop) / 300);
          image.style.transform = `scale(${scale})`;
        } else {
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
    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // o usa environment.apiKey
    return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=16`;
  }

  loadReviews() {
    if (!this.location || this.reviewsLoading || this.reviewsFinished) return;

    this.reviewsLoading = true;
    this.reviewService.getReviews(this.location.id, this.page, this.limit).subscribe({
      next: paginated => {
        this.reviews.push(...paginated.results);
        this.page++;
        this.reviewsLoading = false;
        if (paginated.results.length < this.limit) {
          this.reviewsFinished = true;
        }
      },
      error: () => {
        this.reviewsLoading = false;
      }
    });
  }

  loadMoreReviews(event: any) {
    setTimeout(() => {
      this.loadReviews();
      event.target.complete();
    }, 1500);
  }
}
