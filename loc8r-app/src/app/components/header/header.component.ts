import { Component, OnInit, Input } from '@angular/core';
import { 
  IonHeader,
  IonTitle,
  IonToolbar,
  IonContent,
  IonButtons,
  IonImg,
} from '@ionic/angular/standalone';
@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    IonHeader,
    IonTitle,
    IonToolbar,
    IonContent,
    IonButtons,
    IonImg
  ]
})
export class HeaderComponent  implements OnInit {
  @Input() title: string = '';

  constructor() { }

  ngOnInit() {}

}
