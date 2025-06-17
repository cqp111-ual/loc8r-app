import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { logInOutline, logOutOutline } from 'ionicons/icons';
import { 
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    HeaderComponent,
    IonContent,
    CommonModule,
    IonButton,
    IonItem,
    IonLabel,
    IonIcon,
  ]
})
export class ProfileComponent  implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  userEmail: string | null = null;
  private subscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    addIcons({logInOutline, logOutOutline});
  }

  ngOnInit() {
    this.subscription = this.authService.userObservable$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userEmail = user?.email ?? null;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  goToHome() {
    this.router.navigateByUrl("/home", { replaceUrl: true });
  }

  logout() { 
    this.authService.logout();
    this.goToHome();
  }

}
