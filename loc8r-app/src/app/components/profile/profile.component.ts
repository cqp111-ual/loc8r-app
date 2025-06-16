import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { IonContent } from '@ionic/angular/standalone';
@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    HeaderComponent,
    IonContent
  ]
})
export class ProfileComponent  implements OnInit {
  constructor() { }
  ngOnInit() {}
}
