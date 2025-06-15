import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import {
  IonTitle,
  IonToolbar,
  IonButton, 
  IonHeader, 
  IonContent, 
  IonInput,
  IonButtons,
  IonCol,
  IonNote,
  IonRow,
  IonCard
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-coord-modal',
  standalone: true,
  templateUrl: './coord-modal.component.html',
  styleUrls: ['./coord-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonTitle,
    IonToolbar,
    IonButton, 
    IonHeader, 
    IonContent, 
    IonInput,
    IonButtons,
    IonCol,
    IonNote,
    IonRow,
    IonCard
  ]
})
export class CoordModalComponent {
  @Input() lat!: number;
  @Input() lng!: number;

  latitude: string = '';
  longitude: string = '';

  googleMapsEmbedUrl!: SafeResourceUrl;
  constructor(
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.latitude = this.lat?.toString() ?? '';
    this.longitude = this.lng?.toString() ?? '';
    this.updateGoogleMapsUrl();
  }

  getGoogleMapsEmbed(lat: string | number, lng: string | number): string {
    const apiKey = environment.googleMapsApiKey;
    const parsedLat = typeof lat === 'string' ? parseFloat(lat) : lat;
    const parsedLng = typeof lng === 'string' ? parseFloat(lng) : lng;
    return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${parsedLat},${parsedLng}&zoom=16`;
  }
  
  updateGoogleMapsUrl() {
    const lat = parseFloat(this.latitude);
    const lng = parseFloat(this.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      const rawUrl = this.getGoogleMapsEmbed(lat, lng);
      this.googleMapsEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
    } else {
      this.googleMapsEmbedUrl = null as any; // opcional: ocultar el iframe si no es válida
    }
  }

  setCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.latitude = pos.coords.latitude.toString();
        this.longitude = pos.coords.longitude.toString();
        this.updateGoogleMapsUrl();
      },
      (error) => alert('Error: ' + error.message)
    );
  }

  get latitudeErrors() {
    const val = parseFloat(this.latitude);
    if (this.latitude === '') {
      return { required: true };
    }
    if (isNaN(val)) {
      return { invalidNumber: true };
    }
    if (val < -90) {
      return { min: true };
    }
    if (val > 90) {
      return { max: true };
    }
    return null;
  }


  get longitudeErrors() {
    const val = parseFloat(this.longitude);
    if (this.latitude === '') {
      return { required: true };
    }
    if (isNaN(val)) {
      return { invalidNumber: true };
    }
    if (val < -180) {
      return { min: true };
    }
    if (val > 180) {
      return { max: true };
    }
    return null;
  }

  save() {
    const lat = parseFloat(this.latitude);
    const lng = parseFloat(this.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      alert('Coordenadas no válidas.');
      return;
    }
    this.modalCtrl.dismiss({ lat, lng });
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}