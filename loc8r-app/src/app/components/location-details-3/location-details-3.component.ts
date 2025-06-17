import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LocationService } from '../../services/location.service'; // ajusta la ruta según tu proyecto
import { LocationModel } from '../../models/location.model'; 
import { ReviewService } from '../../services/review.service';
import { Review } from '../../interfaces/location.interface'; // ajusta la ruta según tu proyecto
import { InfiniteScrollCustomEvent } from '@ionic/core';
import { ToastController, AlertController } from '@ionic/angular';
import { CustomBackButtonComponent } from '../custom-back-button/custom-back-button.component';
import {
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonLabel,
  IonNote,
  IonItem
} from '@ionic/angular/standalone';
@Component({
  selector: 'app-location-details-3',
  standalone: true,
  templateUrl: './location-details-3.component.html',
  styleUrls: ['./location-details-3.component.scss'],
  imports: [
    CommonModule,
    CustomBackButtonComponent,
    IonContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonLabel,
    IonNote,
    IonItem,
  ]
})
export class LocationDetails3Component  implements OnInit {

  // Variables para el formulario de reseñas
  @ViewChild('authorInput') authorInput!: IonInput;
  @ViewChild('reviewTextInput') reviewTextInput!: IonTextarea;
  @ViewChild('ratingInput') ratingInput!: IonSelect;
  @ViewChild('coordsInput') coordsInput!: IonInput;
  showError = false;

  // Para mostrar errores dinámicos en HTML
  authorValue: string = '';
  reviewTextValue: string = '';
  ratingValue: number | null = null;
  coordsValue: string = '';
  invalidCoords = false; 

  // Variables para la location
  locationId: string | null = null;
  location?: LocationModel;
  isLoading = false;
  errorMsg = '';

  reviews: Review[] = [];
  page = 0;
  limit = 2;
  reviewsLoading = false;
  reviewsFinished = false;

  constructor(
    private route: ActivatedRoute,
    private locationService: LocationService,
    private reviewService: ReviewService,
    private toastController: ToastController,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    this.locationId = this.route.snapshot.paramMap.get('id');
    if (!this.locationId) {
      this.errorMsg = 'No se proporcionó ID de la location.';
      return;
    }

    this.loadLocation(this.locationId);
  }

  loadLocation(id: string) {
    this.isLoading = true;
    this.errorMsg = '';
    this.location = undefined;

    this.locationService.getLocationById(id).subscribe({
      next: (loc) => {
        if (loc) {
          this.location = loc;
          this.loadReviews();
        } else {
          this.errorMsg = 'Location no encontrada.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        // console.error('Error al cargar location:', err);
        this.errorMsg = 'Error al cargar la location. Por favor, inténtalo más tarde.';
        this.isLoading = false;
      }
    });
  }

  loadReviews() {
    console.log('Cargando reseñas para la location:', this.location?.id);

    if (!this.location || this.reviewsLoading || this.reviewsFinished) return;

    console.log('Cargando reseñas para la location:', this.location.id);
    console.log(`Página: ${this.page}, Límite: ${this.limit}`);

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
  

  // Métodos vacíos por ahora
  editLocation() {
    console.log('Editar location', this.location);
  }

  deleteLocation() {
    console.log('Eliminar location', this.location);
  }

  addReview(comment: string) {
    console.log('Comentario enviado:', comment);
  }

  testClick() {
    console.log('Botón de prueba clickeado');
  }

  loadMore(event: InfiniteScrollCustomEvent) {
    console.log('Loading reviews...');
    this.loadReviews();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
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
        this.limit = currentLength > 0 ? currentLength - 1 : 10; // Ajusta límite si quieres
        this.loadReviews();
      } else {
        this.presentToast('Error al eliminar la review', 'danger');
      }
    });
  }
  
  // Método para insertar una nueva reseña
  async onSubmit() {
    const author = (await this.authorInput.getInputElement()).value?.toString().trim() || '';
    const reviewText = (await this.reviewTextInput.getInputElement()).value?.toString().trim() || '';
    const rating = this.ratingInput.value ?? null;
    const coordsRaw = (await this.coordsInput.getInputElement()).value?.toString().trim() || '';

    // Actualiza valores para mostrar errores en la plantilla
    this.authorValue = author;
    this.reviewTextValue = reviewText;
    this.ratingValue = rating;
    this.coordsValue = coordsRaw;

    if (!author || !reviewText || rating === null || !coordsRaw) {
      this.showError = true;
      return;
    }

    this.invalidCoords = false; // Reiniciar estado del error

    const coordinates = coordsRaw
      .split(',')
      .map(c => parseFloat(c.trim()))
      .filter(n => !isNaN(n));

    if (coordinates.length !== 2) {
      this.invalidCoords = true;
      this.showError = true;
      return;
    }

    this.showError = false;

    const review = {
      author,
      reviewText,
      rating,
      coordinates,
    };

    console.log(`Comentario recibido: ${review}`);
    
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
        this.limit = currentLength + 1;
        this.loadReviews();
      } else {
        this.presentToast('Error al insertar la review', 'danger');
      }
    });
  }

  resetForm() {
    this.authorInput.value = '';
    this.reviewTextInput.value = '';
    this.ratingInput.value = null;
    this.coordsInput.value = '';
    this.authorValue = '';
    this.reviewTextValue = '';
    this.ratingValue = null;
    this.coordsValue = '';
    this.invalidCoords = false; // Reiniciar estado del error
    this.showError = false; // Reiniciar estado de error
  }

}

