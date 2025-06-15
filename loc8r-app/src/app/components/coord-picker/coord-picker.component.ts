import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalController, IonButton, IonIcon } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoordModalComponent } from '../coord-modal/coord-modal.component';
import { addIcons } from 'ionicons';
import { locationOutline } from 'ionicons/icons';
@Component({
  selector: 'app-coord-picker',
  standalone: true,
  templateUrl: './coord-picker.component.html',
  styleUrls: ['./coord-picker.component.scss'],
  imports: [
    IonIcon,
    IonButton,
    FormsModule,
    CommonModule
  ]
})
export class CoordPickerComponent {
  @Input() title = 'Editar coordenadas';
  @Input() lat!: number;
  @Input() lng!: number;

  @Input() style: 'default-style' | 'search-card-style' | 'review-card-style' = 'default-style';
  @Input() size: 'small' | 'default' | 'large' = 'small';
  @Input() color: string = 'primary';
  @Input() disabled: boolean = false;

  @Output() coordinatesChange = new EventEmitter<{ lat: number; lng: number }>();

  constructor(private modalCtrl: ModalController) {
    addIcons({ locationOutline });
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: CoordModalComponent,
      componentProps: { lat: this.lat, lng: this.lng },
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role !== 'cancel' && data) {
      this.coordinatesChange.emit(data);
    }
  }
}








