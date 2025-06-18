import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { LocationService } from '../../services/location.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; 
import { Camera, CameraResultType } from '@capacitor/camera'; 
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AuthProtectedPageComponent } from '../auth-protected-page/auth-protected-page.component';
import { CustomBackButtonComponent } from '../custom-back-button/custom-back-button.component';
import { addIcons } from 'ionicons';
import { 
  ReactiveFormsModule, 
  FormsModule, 
  FormBuilder, 
  FormGroup, 
  Validators, 
  FormControl, 
  ValidatorFn, 
  AbstractControl, 
  ValidationErrors
} from '@angular/forms';
import { 
  removeCircle, 
  closeCircle, 
  checkmarkCircle, 
  alertCircle, 
  alert, 
  close, 
  camera
} from 'ionicons/icons';
import {
  ViewWillEnter,
  NavController,
  ToastController,
  LoadingController,
  // ui components
  IonContent,
  IonButton,
  IonLabel,
  IonInput,
  IonItem,
  IonTextarea,
  IonNote,
  IonIcon,
  IonRow,
  IonCol,
  IonChip,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonCardHeader
} from '@ionic/angular/standalone';
import { CoordPickerComponent } from '../coord-picker/coord-picker.component';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationModel } from '../../models/location.model';

/**
 * 
 * @returns Custom form validators
 */
function nonEmptyTrimmedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value === 'string' && value.trim() === '') {
      return { emptyTrimmed: true };
    }
    return null;
  };
}

function coordinatesValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value;
  if (!val || !Array.isArray(val) || val.length !== 2) return { invalidCoordinates: true };
  const [lat, lng] = val;
  if (typeof lat !== 'number' || typeof lng !== 'number') return { invalidCoordinates: true };
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { invalidCoordinates: true };
  return null;
}

/**
 * Component
 */
@Component({
  selector: 'app-location-form',
  standalone: true,
  templateUrl: './location-form.component.html',
  styleUrls: ['./location-form.component.scss'],
  imports: [
    AuthProtectedPageComponent,
    HeaderComponent,
    CommonModule,
    ReactiveFormsModule, 
    FormsModule,
    IonContent, 
    CustomBackButtonComponent,
    IonButton,
    IonLabel,
    IonInput,
    IonItem,
    IonTextarea,
    IonNote,
    IonIcon,
    CoordPickerComponent,
    IonRow,
    IonCol,
    IonChip,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonSpinner,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
  ]
})
export class LocationFormComponent implements OnInit, ViewWillEnter, OnDestroy {
  
  // control
  isLoading: boolean = false;
  isLoggedIn: boolean = false;
  private subscription?: Subscription;

  // edit or create
  isEdit: boolean = false;
  headerTitle: string = 'Añadir Ubicación';

  // location (if edit)
  locationId: string | null = null;
  location?: LocationModel;
  
  // Form group
  form!: FormGroup;

  // Auxiliar etiquetas
  newTagControl = new FormControl('');

  // Control de imagen
  imageOption: 'none' | 'url' | 'file' = 'none';
  allowImageEdit: boolean = false; // Solo se usa en modo edición

  // Cámara
  public cameraPhoto?: SafeResourceUrl;
  cameraPhotoBase64: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private locationService: LocationService,
    private sanitizer: DomSanitizer,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router
  ) { 
    addIcons({
      removeCircle, 
      closeCircle, 
      checkmarkCircle, 
      alertCircle, 
      alert, 
      close, 
      camera
    })
  }

  ngOnInit() {
    this.subscription = this.authService.userObservable$.subscribe(user => {
      this.isLoggedIn = !!user;
    });

    this.form = this.fb.group({
      name: ['', [Validators.required, nonEmptyTrimmedValidator()]],
      coordinates: [null, [Validators.required, coordinatesValidator]],
      address: ['', []],
      description: ['', [Validators.maxLength(1000)]],
      tags: [[], []],
      imageUrl: [null, this.customImageUrlValidator.bind(this)],
    });
  }

  ionViewWillEnter(): void {
    this.isEdit = !(this.router.url.includes('/locations-add'));

    // console.log('Edit mode: ', this.isEdit);      

    if(this.isEdit) {
      this.headerTitle = "Editar Ubicación"
      this.locationId = this.activatedRoute.snapshot.paramMap.get('id');
      if (!this.locationId) {
        this.handleLocationNotFound();
        return;
      }
      this.loadLocation(this.locationId);
    } else {
      this.locationId = null;
      this.location = undefined;
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  /**
   * Cargar location en caso de edit
   */
  loadLocation(id: string) {
    this.isLoading = true;
    this.location = undefined;

    this.locationService.getLocationById(id).subscribe({
      next: (loc) => {
        if (loc) {
          this.location = loc;

          this.form.patchValue({
            name: this.location.name,
            coordinates: this.location.coordinates || null,
            address: this.location.address,
            description: this.location.description,
            tags: this.location.tags || [],
          });

        } else {
          this.handleLocationNotFound();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar location:', err);
        this.isLoading = false;
        this.handleLocationNotFound();
      }
    });
  }

  async handleLocationNotFound() {
    this.isLoading = false; 
    await this.presentToast('Ubicación no encontrada', 'danger');
    setTimeout(() => {
      this.navCtrl.navigateRoot('/locations');
    }, 2000);
  }

  /**
   * Genericos: mostrar toast, loading....
   */
  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  /** 
   * Componente coord picker
   */
  onCoordinatesChanged(coords: { lat: number; lng: number }) {
    this.form.get('coordinates')?.setValue([coords.lat, coords.lng]);
    this.form.get('coordinates')?.markAsTouched();
  }
  
  formatCoordinates(): string {
    const coords = this.form.get('coordinates')?.value;
    return coords ? `[${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}]` : '';
  }

  /**
   * Getters de FormControl
   */
  get nameControl(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get nameControlEqual(): boolean {
    if (!this.isEdit || !this.location) return false;
    const val = this.nameControl.value;
    return val && val.trim() === this.location.name;
  }

  get coordinatesControl(): FormControl {
    return this.form.get('coordinates') as FormControl;
  }

  get coordinatesControlEqual(): boolean {
    if (!this.isEdit || !this.location) return false;
    const val = this.coordinatesControl.value;
    if (!val || !Array.isArray(val) || val.length !== 2) return false;
    const [lat, lng] = val;
    const [locLat, locLng] = this.location.coordinates || [null, null];
    return lat === locLat && lng === locLng;
  }

  get addressControl(): FormControl {
    return this.form.get('address') as FormControl;
  }

  get addressControlEqual(): boolean {
    if (!this.isEdit || !this.location) return false;
    const val = this.addressControl.value;
    return val && val.trim() === this.location.address;
  }

  get descriptionControl(): FormControl {
    return this.form.get('description') as FormControl;
  }

  get descriptionControlEqual(): boolean {
    if (!this.isEdit || !this.location) return false;
    const val = this.descriptionControl.value;
    return val && val.trim() === this.location.description;
  }

  get tagsControl(): FormControl {
    return this.form.get('tags') as FormControl;
  }

  get tagsControlEqual(): boolean {
    if (!this.isEdit || !this.location) return false;
    const formTags = [...(this.tagsControl.value || [])].sort();
    const originalTags = [...(this.location.tags || [])].sort();
  
    if (formTags.length !== originalTags.length) return false;
  
    return formTags.every((tag, i) => tag === originalTags[i]);
  }
  
  get imageUrlControl(): FormControl {
    return this.form.get('imageUrl') as FormControl;
  }

  // Validador de Url para la imagen
  customImageUrlValidator(control: AbstractControl): ValidationErrors | null {
    const shouldValidate = 
      (this.isEdit && this.allowImageEdit && this.imageOption === 'url') || 
      (!this.isEdit && this.imageOption === 'url');

    const value = control.value?.trim();
    if (!shouldValidate) return null;
    if (!value) return null;

    const urlRegex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
    return urlRegex.test(value) ? null : { invalidUrl: true };
  }

  // Necesarios para validar en funcion de otros campos
  onAllowImageEditChange(newVal: boolean): void {
    this.allowImageEdit = newVal;
    this.imageUrlControl.updateValueAndValidity();
  }
  onImageOptionChange(newVal: 'none' | 'url' | 'file'): void {
    this.imageOption = newVal;
    this.imageUrlControl.updateValueAndValidity();
  }

  /**
   * Estilos de campos del formulario
   */
  getFormFieldIcon(control: FormControl, fieldName: string, originalValue?: string): string {
    if (!control) return '';
  
    if (control.invalid && (control.dirty || control.touched)) {
      return 'alert-circle';
    }
  
    if (originalValue !== undefined) {
      if (control.value?.trim() === originalValue) {
        return 'remove-circle';  // igual, sin cambios
      }
    }

    if (!control.touched) return '';
    
    if (control.valid) {
      return 'checkmark-circle';
    }
  
    return '';
  }

  // Especifico para coordenadas (array)
  getCoordinatesFieldIcon(): string {
    const control = this.coordinatesControl;
    if (!control) return '';
  
    if (this.coordinatesControlEqual) {
      return 'remove-circle'; // sin cambios
    }
  
    if (control.invalid && (control.dirty || control.touched)) {
      return 'alert-circle';
    }
  
    if (control.valid) {
      return 'checkmark-circle';
    }
  
    return '';
  }

  /**
   * Manejo de etiquetas
   */
  addTag() {
    const tag = this.newTagControl.value?.trim();
    const currentTags = this.tagsControl;
  
    if (tag && currentTags && !currentTags.value.includes(tag)) {
      currentTags.setValue([...currentTags.value, tag]);
    }
  
    this.newTagControl.setValue('');
  }
  
  removeTag(index: number) {
    const currentTags = this.tagsControl;
    if (currentTags) {
      const updated = [...currentTags.value];
      updated.splice(index, 1);
      currentTags.setValue(updated);
    }
  }
  
  /**
   * Envío del formulario
   */
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  
    const formData = this.form.value;
  
    let imageUrl = null;
    let imageFile = null;

    if (!this.isEdit) {
      // imagen
      if (this.imageOption === 'url') {
        imageUrl = this.imageUrlControl.value?.trim() || null;
      } else if (this.imageOption === 'file' && this.cameraPhotoBase64) {
        imageFile = this.base64ToFile(this.cameraPhotoBase64);
      }

      const locationData = {
        name: formData.name,
        coordinates: JSON.stringify(formData.coordinates),
        address: formData.address,
        description: formData.description,
        tags: JSON.stringify(formData.tags),
        imageUrl,
        imageFile,
      };

      // console.log('Enviando ubicación (nuevo):', locationData);

      this.isLoading = true;

      this.locationService.createLocation(locationData).subscribe({
        next: (created) => {
          this.isLoading = false;
          this.presentToast('Ubicación creada correctamente', 'success');
          this.resetFormValues();
          this.navCtrl.navigateForward(`/locations/${created.id}`);
      },
        error: (err) => {
          this.isLoading = false;
          console.error('Error al crear ubicación', err);
          this.presentToast('Error al crear ubicación', 'danger');
        },
      });

    } else {
      // Edición: solo enviar los campos que hayan cambiado

      if(this.allowImageEdit) {
        if (this.imageOption === 'url') {
          imageUrl = this.imageUrlControl.value?.trim() || null;
        } else if (this.imageOption === 'file' && this.cameraPhotoBase64) {
          imageFile = this.base64ToFile(this.cameraPhotoBase64);
        } else {
          // fuerza el borrado de la imagen
          imageUrl = ' '
        }
      }

      const changedData = {
        name: !this.nameControlEqual ? formData.name : undefined,
        coordinates: !this.coordinatesControlEqual ? JSON.stringify(formData.coordinates) : undefined,
        address: !this.addressControlEqual ? formData.address : undefined,
        description: !this.descriptionControlEqual ? formData.description : undefined,
        tags: !this.tagsControlEqual ? JSON.stringify(formData.tags) : undefined,
        imageUrl: imageUrl || undefined,
        imageFile: imageFile || undefined
      }

      const hasChangedData = Object.values(changedData).some(value => value !== undefined);

      // Antes de enviar, intenta comprobar que changedData tenga al menos un campo que no sea null...
      if(this.locationId && hasChangedData) {
        // console.log('Actualizando ubicación (id=', this.locationId, 'con la siguiente información: ', changedData);
        this.isLoading = true;
        this.locationService.updateLocation(this.locationId, changedData).subscribe({
          next: (created) => {
            this.isLoading = false;
            this.presentToast('Ubicación actualizada correctamente', 'success');
            this.resetFormValues();
            this.navCtrl.navigateBack(`/locations/${created.id}`);
        },
          error: (err) => {
            this.isLoading = false;
            console.error('Error al crear ubicación', err);
            this.presentToast('Error al crear ubicación', 'danger');
          },
        });
      } else {
        this.presentToast('Actualice al menos un campo', 'warning');
      }
    }
  }

  /**
   * Reset de los atributos/formularios
  */
  resetFormValues() {
    this.cameraPhotoBase64 = null;
    this.cameraPhoto = undefined;
    this.imageOption = 'none';
    this.form.reset();
    // this.isEdit = false;
  }
  
  /**
   * Camara e imagen
   */
  public async takePicture(): Promise<void> {
    const allowedMimeTypes: string[] = ['jpg', 'jpeg', 'png', 'webp'];

    try {
      const image = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        // resultType: CameraResultType.Uri,
        resultType: CameraResultType.DataUrl,
        correctOrientation: true
      });

      if (!image.dataUrl) return;

      const extension = image.format;
      if (!allowedMimeTypes.includes(extension)) {
        this.presentToast('Formato de imagen no permitido (solo JPG, PNG, WEBP).', 'danger');
        return;
      }

      this.cameraPhotoBase64 = image.dataUrl;
      this.cameraPhoto = this.sanitizer.bypassSecurityTrustResourceUrl(this.cameraPhotoBase64);
    } catch (error: any) {
      if (error?.message?.toLowerCase().includes('user cancelled')) {
        // Si el usuario cancela, no hacemos nada
        return;
      }

      // Otros errores sí se notifican
      this.presentToast('Error al capturar la foto.', 'danger');
      console.error('Error al capturar la foto:', error);
    }
  }

  base64ToFile(base64Data: string): File {
    const arr = base64Data.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    // Generar nombre aleatorio
    const ext = mime.split('/')[1] || 'png';
    const randomName = `image-${Math.random().toString(36).substring(2, 10)}.${ext}`;

    const blob = new Blob([u8arr], { type: mime });
    return new File([blob], randomName, { type: mime });
  }
}
