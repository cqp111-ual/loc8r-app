import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LocationService } from '../../services/location.service'; // ajusta la ruta según tu proyecto
import { LocationModel } from '../../models/location.model'; 
import { ReviewService } from '../../services/review.service';
import { Review } from '../../interfaces/location.interface'; // ajusta la ruta según tu proyecto
import { InfiniteScrollCustomEvent } from '@ionic/core';
import { ToastController, AlertController } from '@ionic/angular';
import { CustomBackButtonComponent } from '../custom-back-button/custom-back-button.component';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../header/header.component';
import { ImageVisualizerComponent } from '../image-visualizer/image-visualizer.component';
import { CommentCardComponent } from '../comment-card/comment-card.component';
import { CommentFormCardComponent } from '../comment-form-card/comment-form-card.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { scanCircleOutline, scanOutline, calendarOutline, pencilOutline, trashOutline, ellipsisHorizontalOutline } from 'ionicons/icons';
import { RatingBadgeComponent } from '../rating-badge/rating-badge.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ViewWillEnter, NavController, ActionSheetController } from '@ionic/angular/standalone';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-location-details',
  standalone: true,
  templateUrl: './location-details.component.html',
  styleUrls: ['./location-details.component.scss'],
  imports: [
    IonicModule,
    CommonModule,
    CustomBackButtonComponent,
    CommentCardComponent,
    HeaderComponent,
    ImageVisualizerComponent,
    CommentFormCardComponent,
    RatingBadgeComponent
  ]
})
export class LocationDetailsComponent implements OnInit, OnDestroy, ViewWillEnter {

  // auth
  isLoggedIn: boolean = true;
  private subscription?: Subscription;
  
  // add review
  resetReviewForm = false;

  // Variables para la location
  locationId: string | null = null;
  location?: LocationModel;
  ratingMessage: string = '';
  googleMapsEmbedUrl!: SafeResourceUrl;


  // other variables...
  isLoading = false;
  errorMsg = '';

  // image control
  showImage: boolean = false;

  // reviews
  reviews: Review[] = [];
  page = 0;
  reviewsLimit = 6;
  reviewsLoading = false;
  reviewsFinished = false;

  constructor(
    private route: ActivatedRoute,
    private locationService: LocationService,
    private reviewService: ReviewService,
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private actionSheetController: ActionSheetController,
    private navController: NavController,
  ) {
    addIcons({scanCircleOutline, scanOutline, calendarOutline, pencilOutline, trashOutline, ellipsisHorizontalOutline});
  }

  ngOnInit() {
    this.subscription = this.authService.userObservable$.subscribe(user => {
      this.isLoggedIn = !!user;
    });

    this.locationId = this.route.snapshot.paramMap.get('id');
    if (!this.locationId) {
      this.errorMsg = 'No se proporcionó ID de la location.';
      return;
    }

    this.loadLocation(this.locationId);
  }

  ionViewWillEnter(): void {
    if (this.locationId) {
      this.loadLocation(this.locationId);
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  loadLocation(id: string) {
    this.isLoading = true;
    this.errorMsg = '';
    this.location = undefined;

    this.locationService.getLocationById(id).subscribe({
      next: (loc) => {
        if (loc) {
          this.location = loc;
          
          // cargar reviews
          this.loadReviews();

          // definir msg rating
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

          // definir url maps
          const rawUrl = this.getGoogleMapsEmbed(this.location?.coordinates[0], this.location?.coordinates[1]);
          this.googleMapsEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);

        } else {
          this.errorMsg = 'No se ha encontrado la ubicación.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        // console.error('Error al cargar location:', err);
        this.errorMsg = 'No se ha encontrado la ubicación.';
        this.isLoading = false;
        this.handleLocationNotFound();
      }
    });
  }

  getGoogleMapsEmbed(lat: number, lng: number): string {
    const apiKey = environment.googleMapsApiKey;
    return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=16`;
  }

  loadReviews() {
    // console.log('Cargando reseñas para la location:', this.location?.id);

    if (!this.location || this.reviewsLoading || this.reviewsFinished) return;

    // console.log('Cargando reseñas para la location:', this.location.id);
    // console.log(`Página: ${this.page}, Límite: ${this.reviewsLimit}`);

    this.reviewsLoading = true;
    this.reviewService.getReviews(this.location.id, this.page, this.reviewsLimit).subscribe({
      next: paginated => {
        this.reviews.push(...paginated.results);
        this.page++;
        this.reviewsLoading = false;
        if (paginated.results.length < this.reviewsLimit) {
          this.reviewsFinished = true;
        }
      },
      error: () => {
        this.reviewsLoading = false;
      }
    });
  }

  resetForm() {
    this.resetReviewForm = true;
    // False para permitir futuros reinicios
    setTimeout(() => this.resetReviewForm = false, 0);
  }

  onReviewSubmit(data: {
    author: string;
    comment: string;
    rating: number;
    coordinates: [number, number];
  }) {
    const review = {
      author: data.author,
      reviewText: data.comment,
      rating: data.rating,
      coordinates: data.coordinates,
    };

    // console.log('Comentario recibido:', review);

    // Llamar al servicio para insertar la reseña
    this.reviewService.insertReview(this.locationId!, review).subscribe(success => {
      if (success) {
        this.presentToast('Review insertada correctamente', 'success');
        // Limpiar formulario
        this.resetForm();

        // Recargar la location para actualizar la vista
        this.reviewsFinished = false;
        this.loadLocation(this.locationId!); 

        // Recargar reseñas para ver el nuevo comentario
        const currentLength = this.reviews.length;
        this.reviews = [];
        this.page = 0;
        this.reviewsLimit = currentLength + 1;
        this.loadReviews();
      } else {
        this.presentToast('Error al insertar la review', 'danger');
      }
    });
  }

  loadMore(event: InfiniteScrollCustomEvent) {
    // console.log('Loading reviews...');
    this.loadReviews();
    setTimeout(() => {
      event.target.complete();
    }, 2500);
  }

  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  // Método para mostrar alerta de confirmación antes de eliminar una reseña
  async alertDeleteReview(reviewId: string) {
    const alert = await this.alertController.create({
      header: '¿Eliminar review?',
      message: '¿Seguro que quieres eliminar esta review?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteReview(reviewId);
          },
        },
      ],
    });
  
    await alert.present();
  }

  // Método para eliminar un review
  deleteReview(id: string) {
    if (!this.locationId) {
      console.error('No hay locationId definido');
      this.presentToast('Error: Location no definida', 'danger');
      return;
    }
  
    this.reviewService.deleteReview(this.locationId, id).subscribe(success => {
      if (success) {
        this.presentToast('Review eliminada correctamente', 'success');
  
        // Recargar location para actualizar rating, número de reviews, etc.
        this.reviewsFinished = false;
        this.loadLocation(this.locationId!);
  
        // Recargar reseñas para refrescar la lista tras eliminación
        const currentLength = this.reviews.length;
        this.reviews = [];
        this.page = 0;
        this.reviewsLimit = currentLength > 0 ? currentLength - 1 : 10; // Ajusta límite si quieres
        this.loadReviews();
      } else {
        this.presentToast('Error al eliminar la review', 'danger');
      }
    });
  } 

  // Opciones
  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Editar',
          handler: () => this.onEdit()
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.alertDeleteLocation()
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
  
    await actionSheet.present();
  }

  // Eliminar location
  async alertDeleteLocation() {
    const alert = await this.alertController.create({
      header: '¿Eliminar ubicación?',
      message: '¿Seguro que quieres eliminar esta ubicación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteLocation();
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  deleteLocation() {
    if (!this.locationId) {
      this.presentToast('Error: ID de ubicación no definido', 'danger');
      return;
    }
  
    this.locationService.deleteLocation(this.locationId).subscribe(success => {
      if (success) {
        this.presentToast('Ubicación eliminada correctamente', 'success');
  
        // Espera unos segundos antes de redirigir
        setTimeout(() => {
          // Redirección con historial limpio (no se puede volver atrás)
          this.navController.navigateRoot('/locations');
        }, 2000);
      } else {
        this.presentToast('Error al eliminar la ubicación', 'danger');
      }
    });
  }

  // Si no se encuentra la location
  handleLocationNotFound() {
    this.isLoading = false;
    this.presentToast('Ubicación no encontrada', 'danger');
  
    setTimeout(() => {
      this.navController.navigateRoot('/locations');
    }, 2000);
  }
  
  onEdit() {
    this.navController.navigateForward(`/locations/${this.locationId}/edit`);
  }

}

