import { Component, OnInit } from '@angular/core';
import { IonButton, ModalController } from '@ionic/angular/standalone';
import { CoordPickerComponent } from '../coord-picker/coord-picker.component';
@Component({
  selector: 'app-test-page',
  standalone: true,
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.scss'],
  imports: [
    IonButton,
    CoordPickerComponent
  ]
})
export class TestPageComponent  implements OnInit {

  latActual: number = 0;
  lngActual: number = 0;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  onCoordinatesChanged(coords: { lat: number; lng: number }) {
    this.latActual = coords.lat;
    this.lngActual = coords.lng;
    console.log('Coordenadas actualizadas:', coords);
  }
  

}
