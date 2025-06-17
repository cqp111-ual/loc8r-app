import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import {
  IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-image-visualizer',
  standalone: true,
  templateUrl: './image-visualizer.component.html',
  styleUrls: ['./image-visualizer.component.scss'],
  imports: [
    CommonModule,
    IonIcon
  ]
})
export class ImageVisualizerComponent {
  @Input() imageUrl: string = '';
  @Output() close = new EventEmitter<void>();

  animationClass = 'zoom-in';

  constructor() {
    addIcons({ closeOutline });
  }

  closeWithAnimation() {
    this.animationClass = 'zoom-out';
    setTimeout(() => {
      this.close.emit();
    }, 400); // duración debe coincidir con la animación
  }

}
