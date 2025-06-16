import { Component, OnInit } from '@angular/core';
import { 
  IonContent,
  IonButton,
  IonCol,
  IonGrid,
  IonText,
  IonCard,
  IonRow,
} from '@ionic/angular/standalone';
@Component({
  selector: 'app-landing-page',
  standalone: true,
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  imports: [
    IonContent,
    IonButton,
    IonRow,
    IonCol,
    IonGrid,
    IonText,
    IonCard
  ]
})
export class LandingPageComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
