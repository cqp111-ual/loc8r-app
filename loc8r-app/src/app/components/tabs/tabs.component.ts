import { Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import { personCircleOutline, homeOutline, compassOutline, addCircleOutline, cloudUploadOutline } from 'ionicons/icons';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel
  ]
})
export class TabsComponent  implements OnInit {

  constructor() { 
    addIcons({
      personCircleOutline,
      homeOutline,
      compassOutline,   
      addCircleOutline, 
      cloudUploadOutline
    });
  }

  ngOnInit() {}

}
