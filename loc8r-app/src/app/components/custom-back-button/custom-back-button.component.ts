import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { NavController, IonButton, IonIcon } from '@ionic/angular/standalone';
@Component({
  selector: 'app-custom-back-button',
  standalone: true,
  templateUrl: './custom-back-button.component.html',
  styleUrls: ['./custom-back-button.component.scss'],
  imports: [
    IonButton,
    IonIcon
  ]
})
export class CustomBackButtonComponent{
  @Input() styleType: 'transparent' | 'filled' = 'transparent';
  @Input() size: 'medium' | 'large' = 'large';

  constructor(
    private router: Router,
    private navController: NavController

  ) {
    addIcons({arrowBackOutline})
  }

  goBack() {
    const url = this.router.url;

    // Procesar ruta
    const segments = url.split('/').filter(segment => segment.length > 0);
    segments.pop();
    const parentUrl = '/' + segments.join('/');

    // Animación navigateBack
    this.navController.navigateBack(parentUrl);
  }
}

