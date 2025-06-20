import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FsqSearchCardComponent } from '../fsq-search-card/fsq-search-card.component';
import { CommonModule } from '@angular/common';
import { LocationFSQ } from '../../interfaces/location.interface';
import { addIcons } from 'ionicons';
import { location } from 'ionicons/icons';
import { RatingBadgeComponent } from '../rating-badge/rating-badge.component';
import { LocationService } from 'src/app/services/location.service';
import { AuthService } from 'src/app/services/auth.service';
import { AuthProtectedPageComponent } from '../auth-protected-page/auth-protected-page.component';
import { 
  IonContent, 
  IonItem,
  IonLabel,
  IonList, 
  IonAccordion,
  IonAccordionGroup,
  IonCheckbox,
  IonFab,
  AlertController,
  IonButton,
  IonAvatar,
  IonIcon,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-fsq-import',
  standalone: true,
  templateUrl: './fsq-import.component.html',
  styleUrls: ['./fsq-import.component.scss'],
  imports: [ 
    AuthProtectedPageComponent,
    HeaderComponent,
    FsqSearchCardComponent,
    RatingBadgeComponent,
    CommonModule,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonAccordion,
    IonAccordionGroup,
    IonCheckbox,
    IonFab,
    IonButton,
    IonAvatar,
    IonIcon,
    IonSpinner
  ]
})
export class FsqImportComponent  implements OnInit, OnDestroy {

  // auth
  isLoggedIn: boolean = false;
  private subscription?: Subscription;
  
  selectedIds: string[] = [];
  maxSelectable = 10;
  isLoading = false;
  importing = false;

  results : LocationFSQ[] = [];
  
  constructor(
    private alertController: AlertController,
    private locationService: LocationService,
    private toastController: ToastController,
    public authService: AuthService,
  ) {
    addIcons({ location });
  }

  ngOnInit() {
    console.log(this.isLoggedIn)
    this.subscription = this.authService.userObservable$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  onSearch(filters: any) {
    console.log('Búsqueda recibida con filtros:', filters);
    this.isLoading = true;
    this.locationService.searchFSQ(filters).subscribe({
      next: (locations) => {
        this.results = locations;
      },
      error: (error) => {
        console.error('Error en la búsqueda:', error);
        this.results = [];
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  toggleSelection(item: LocationFSQ) {
    const index = this.selectedIds.indexOf(item.id);
    if (index >= 0) {
      this.selectedIds.splice(index, 1);
    } else if (this.selectedIds.length < this.maxSelectable) {
      this.selectedIds.push(item.id);
    }
  }

  async onImportClick() {
    const alert = await this.alertController.create({
      header: 'Confirmar importación',
      message: `¿Seguro que deseas importar ${this.selectedIds.length} elemento(s)?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Importar',
          handler: () => {
            console.log('Importando IDs:', this.selectedIds);
            this.importSelected();
          },
        },
      ],
    });

    await alert.present();
  }

  async presentToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  importSelected() {
    if (this.selectedIds.length === 0) return;

    this.importing = true;

    this.locationService.importFSQ(this.selectedIds).subscribe({
      next: ({ inserted, failed }) => {
        const total = this.selectedIds.length;
        const numImported = inserted.length;

        // Mostrar toast
        if (inserted.length === total) {
           this.presentToast(`Importadas ${numImported}/${total} ubicaciones.`, 'success');
        } else if (inserted.length > 0) {
          this.presentToast(`Importadas ${numImported}/${total} ubicaciones.`, 'warning');
        } else {
          this.presentToast(`No se pudo importar ninguna ubicación.`, 'danger');
        }

        // Limpiar las importadas del resultado y del selected
        this.results = this.results.filter(loc => !inserted.includes(loc.id));
        this.selectedIds = this.selectedIds.filter(id => !inserted.includes(id));
      },
      error: () => {
        this.presentToast('Error al importar ubicaciones.', 'danger');
      },
      complete: () => {
        this.importing = false;
      }
    });
  }

}
