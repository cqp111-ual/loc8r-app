import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, FormsModule, NgModel } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { LocationService } from '../../services/location.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; 
import { Camera, CameraResultType } from '@capacitor/camera'; 
import { addIcons } from 'ionicons';
import { removeCircle, closeCircle, checkmarkCircle, alertCircle, alert, close, camera} from 'ionicons/icons';
import {
  Platform,
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
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { CoordPickerComponent } from '../coord-picker/coord-picker.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AuthProtectedPageComponent } from '../auth-protected-page/auth-protected-page.component';
// Modelo para representar un campo de formulario
interface FormField<T = any> {
  value: T;
  original: T;
  valid: boolean;
  touched: boolean;
}

@Component({
  selector: 'app-location-form',
  standalone: true,
  templateUrl: './location-form.component.html',
  styleUrls: ['./location-form.component.scss'],
  imports: [
    AuthProtectedPageComponent,
    HeaderComponent,
    CommonModule,
    FormsModule,
    IonContent, 
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
    IonFab,
    IonFabButton
  ]
})
export class LocationFormComponent implements OnInit, OnDestroy {
  
  @ViewChild('locationForm') locationForm!: NgForm;

  // auth
  isLoggedIn: boolean = false;
  private subscription?: Subscription;

  // Los componentes de input no se ven bien en iOS
  isIos = false;

  // Flag para indicar si estamos en modo edición
  isEditMode = true;
  allowImageEdit = false;
  imageOption: 'none' | 'url' | 'file' = 'none';

  formFields: Record<string, FormField> = {
    name: { value: undefined, original: 'John', valid: false, touched: false },
    address: { value: '', original: '', valid: true, touched: false },
    description: { value: '', original: '', valid: true, touched: false },
    longitude: { value: undefined, original: '', valid: false, touched: false },
    latitude: { value: undefined, original: '', valid: false, touched: false },
    coordinates: { value: '', original: '', valid: false, touched: false },
    tags: { value: '', original: '', valid: true, touched: false },
    imageUrl: { value: '', original: '', valid: true, touched: false }
  };

  name = '';
  address = '';
  description = '';
  coordinates = '';
  tagsString = '';
  imageUrl = '';
  imageFile: File | null = null;
  fileError = '';

  photo: string | null = null; // base64 o blob

  public cameraPhoto?: SafeResourceUrl; 

  constructor(
    private authService: AuthService,
    private locationService: LocationService,
    private sanitizer: DomSanitizer,
    private platform: Platform
  ) {
    this.isIos = this.platform.is('ios');
    addIcons({ removeCircle, closeCircle, checkmarkCircle, alertCircle, alert, close, camera });
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

  getFormFieldStatusDebug(
    model: NgModel,
    fieldName: string
  ): 'unchanged' | 'valid' | 'invalid' | 'empty' | 'pristine' {
    const status = this.getFormFieldStatus(model, fieldName);
    // console.log(`${fieldName}.status: ${status}`);
    return status;
  }

  getFormFieldStatus(
    model: NgModel,
    fieldName: string
  ): 'unchanged' | 'valid' | 'invalid' | 'empty' | 'pristine' {
    const currentValue = (model.value ?? '').toString().trim();
    const originalValue = (this.formFields[fieldName]?.original ?? '').toString().trim();

    // 1. valor no tocado
    if (!model.dirty && !model.touched) return 'pristine';
  
    // 2. invalid: el campo no cumple con las validaciones
    if (model.invalid) return 'invalid';
  
    // 3. empty: campo vacio
    if (currentValue === '') return 'empty';

    // 4. unchanged: valor actual igual al original
    if (currentValue === originalValue) return 'unchanged';

    // 5. valid: pasa validaciones y no está vacío ni unchanged
    if (model.valid) return 'valid';
  
    // 6. pristine: estado por defecto (sin interacción)
    return 'pristine';
  }
  
  getFormFieldIcon(model: NgModel, fieldName: string): string {
    const status = this.getFormFieldStatusDebug(model, fieldName);
  
    switch (status) {
      case 'valid':
        return 'checkmark-circle';
      case 'invalid':
        return 'alert-circle';
      case 'unchanged':
        return 'remove-circle';
      case 'empty':
      case 'pristine':
      default:
        return '';
    }
  }
  
  getFormFieldColor(model: NgModel, fieldName: string): string | undefined {
    const status = this.getFormFieldStatus(model, fieldName);
  
    switch (status) {
      case 'valid':
        return 'success'; // Verde o similar
      case 'invalid':
        return 'danger'; // Rojo
      case 'unchanged':
        return 'medium'; // Gris o neutro, para diferenciar unchanged
      // empty y pristine no cambian color (undefined = estilo por defecto)
      case 'empty':
      case 'pristine':
      default:
        return undefined;
    }
  }

  // Establecer coordenadas desde el modal
  onCoordinatesChanged(coords: { lat: number; lng: number }) {
    this.formFields['latitude'].value = coords.lat;
    this.formFields['longitude'].value = coords.lng;
    console.log('Coordenadas actualizadas:', coords);
  }

  // Testing tags

  tags: string[] = [];
  newTag: string = '';

  addTag() {
    const trimmed = this.newTag.trim();
    if (trimmed && !this.tags.includes(trimmed)) {
      this.tags.push(trimmed);
    }
    this.newTag = '';
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
  }

  areTagsValid(tags: string[]): boolean {
    return tags.every(tag => typeof tag === 'string' && tag.trim().length > 0);
  }

  public async takePicture(): Promise<void> { 
    try {
      const image = await Camera.getPhoto({ 
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Uri
      });

      if (image.webPath) {
        this.cameraPhoto = this.sanitizer.bypassSecurityTrustResourceUrl(image.webPath); 
      }
    } catch (error) {
      console.error('Error al capturar la foto:', error);
    }
  }

  handleImageInput() {
    // Si más adelante quieres integrar @capacitor/camera
    console.log('on handleInput');
  }

  // -----------------

  // Compara el valor actual del campo con el original
  hasChanged(fieldName: string): boolean {
    // if (!this.isEditMode) return true;
    const field = this.formFields[fieldName];
    return field.value !== field.original;   
  }




  loadLocation(location: any) {
    // this.isEditMode = true;
    // this.formFields.name.original = location.name;
    // this.formFields.name.value = location.name;
  
    // this.formFields.address.original = location.address;
    // this.formFields.address.value = location.address;
  
    // ... repite para los demás campos
  }
  
  getFieldStatus(fieldName: string): 'valid' | 'invalid' | 'unchanged' {
    const field = this.formFields[fieldName];
    if (!field.touched || !this.hasChanged(fieldName)) return 'unchanged';
    return field.valid ? 'valid' : 'invalid';
  }
  
  getFieldIcon(fieldName: string): string {
    const status = this.getFieldStatus(fieldName);
    if (status === 'valid') return 'checkmark-circle';
    if (status === 'invalid') return 'close-circle';
    return 'remove-circle';
  }
  
  getFieldColor(fieldName: string): string {
    const status = this.getFieldStatus(fieldName);
    if (status === 'valid') return 'success';
    if (status === 'invalid') return 'danger';
    return 'medium';
  }
  
  onFieldInput(fieldName: string): void {
    const field = this.formFields[fieldName];
    field.touched = true;
    field.valid = field.value.trim().length >= 3;
  }
  onFieldBlur(fieldName: string): void {
    // Puedes forzar revalidación si quieres, o simplemente marcar como tocado
    this.formFields[fieldName].touched = true;
  }

  /**
   * 
   */
  get canSubmit(): boolean {
    if (!this.locationForm || this.locationForm.invalid) return false;
  
    if (!this.isValidCoordinates(this.coordinates)) return false;
  
    if (this.tagsString.trim() !== '' && !this.isValidTags(this.tagsString)) return false;
  
    if (this.fileError) return false;
  
    return true;
  }
  
  onSubmit() {
    console.log('Formulario inválido');
    console.log(this.locationForm);
    if (!this.canSubmit) return;
  
    const locationData = {
      name: this.name.trim(),
      address: this.address.trim(),
      description: this.description.trim(),
      coordinates: this.coordinates,
      tags: this.tagsString,
      imageUrl: this.imageUrl,
      imageFile: this.imageFile,
    };
  
    console.log('Enviando ubicación:', locationData);
  
    // TODO: Llama aquí a tu servicio de envío o guardar
    this.locationService.createLocation(locationData).subscribe({
      next: (created) => {
        console.log('Ubicación creada:', created);
        // Aquí puedes redirigir o mostrar mensaje de éxito
      },
      error: (err) => {
        console.error('Error al crear ubicación', err);
        // Aquí puedes mostrar mensaje de error
      }
    });
  }
  

  isValidCoordinates(value: string): boolean {
    try {
      const coords = JSON.parse(value);
      return (
        Array.isArray(coords) &&
        coords.length === 2 &&
        typeof coords[0] === 'number' &&
        typeof coords[1] === 'number'
      );
    } catch {
      return false;
    }
  }

  isValidTags(value: string): boolean {
    try {
      const tags = JSON.parse(value);
      return (
        Array.isArray(tags) &&
        tags.every(tag => typeof tag === 'string')
      );
    } catch {
      return false;
    }
  }

  onFileChange(event: any) {
    this.fileError = '';
    const file = event.target.files?.[0];
    if (!file) {
      this.imageFile = null;
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Formato de archivo no válido. Solo jpg, jpeg, png, webp.';
      this.imageFile = null;
      return;
    }

    this.imageFile = file;
  }

}