import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, FormsModule } from '@angular/forms';
import { LocationService } from '../../services/location.service';
import { addIcons } from 'ionicons';
import { removeCircle, closeCircle, checkmarkCircle, alertCircle } from 'ionicons/icons';
import { 
  IonButton,
  IonLabel,
  IonInput,
  IonItem,
  IonTextarea,
  IonNote,
  IonIcon,
} from '@ionic/angular/standalone';

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
    CommonModule,
    FormsModule,
    IonButton,
    IonLabel,
    IonInput,
    IonItem,
    IonTextarea,
    IonNote,
    IonIcon,
  ]
})
export class LocationFormComponent {
  
  @ViewChild('locationForm') locationForm!: NgForm;

  // Flag para indicar si estamos en modo edición
  isEditMode = false;

  formFields: Record<string, FormField> = {
    name: { value: '', original: '', valid: false, touched: false },
    address: { value: '', original: '', valid: true, touched: false },
    description: { value: '', original: '', valid: true, touched: false },
    coordinates: { value: '', original: '', valid: false, touched: false },
    tags: { value: '', original: '', valid: true, touched: false },
    imageUrl: { value: '', original: '', valid: true, touched: false }
  };

  name = '';
  address = '';
  description = '';
  coordinates = '';
  tags = '';
  imageUrl = '';
  imageFile: File | null = null;
  fileError = '';


  constructor(private locationService: LocationService) {
    addIcons({ removeCircle, closeCircle, checkmarkCircle, alertCircle  });
  }

  // Compara el valor actual del campo con el original
  hasChanged(fieldName: string): boolean {
    if (!this.isEditMode) return true;
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
  


  get canSubmit(): boolean {
    if (!this.locationForm || this.locationForm.invalid) return false;
  
    if (!this.isValidCoordinates(this.coordinates)) return false;
  
    if (this.tags.trim() !== '' && !this.isValidTags(this.tags)) return false;
  
    if (this.fileError) return false;
  
    return true;
  }
  
  onSubmit() {
    if (!this.canSubmit) return;
  
    const locationData = {
      name: this.name.trim(),
      address: this.address.trim(),
      description: this.description.trim(),
      coordinates: this.coordinates,
      tags: this.tags,
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



testValue = 'Carlos';
get testStatus(): 'empty' | 'invalid' | 'valid' {
  if (!this.testValue || this.testValue.trim() === '') return 'empty';
  if (this.testValue.length < 3) return 'invalid';
  return 'valid';
}

get testIcon(): string {
  switch (this.testStatus) {
    case 'valid': return 'checkmark-circle';
    case 'invalid': return 'alert-circle';
    default: return 'remove-circle';
  }
}

get testColor(): string {
  switch (this.testStatus) {
    case 'valid': return 'success'; // ionic color palette
    case 'invalid': return 'danger';
    default: return 'medium';
  }
}

}