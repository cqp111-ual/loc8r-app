import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoordPickerComponent } from '../coord-picker/coord-picker.component';
import { IonicModule } from '@ionic/angular';
import { 
  FormsModule, 
  ReactiveFormsModule, 
  FormGroup,
  Validators, 
  FormBuilder, 
  FormControl, 
  AbstractControl, 
  ValidationErrors, 
  ValidatorFn 
} from '@angular/forms';

// Funcion para validar text area
function requiredTrimmedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value === 'string' && value.trim().length === 0) {
      return { requiredTrimmed: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-comment-form-card',
  standalone: true,
  templateUrl: './comment-form-card.component.html',
  styleUrls: ['./comment-form-card.component.scss'],
  imports: [
    CoordPickerComponent,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class CommentFormCardComponent {
  @Input() resetTrigger = false;
  @Output() submitReview = new EventEmitter<{
    author: string;
    comment: string;
    rating: number;
    coordinates: [number, number];
  }>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      author: ['', Validators.required],
      comment: ['', [Validators.maxLength(1000), requiredTrimmedValidator()]],
      rating: [null, [Validators.required, Validators.min(0), Validators.max(5)]],
      coordinates: [null, Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resetTrigger'] && this.resetTrigger) {
      this.form.reset();
    }
  }

  onCoordinatesChanged(coords: { lat: number; lng: number }) {
    this.form.get('coordinates')?.setValue([coords.lat, coords.lng]);
    this.form.get('coordinates')?.markAsTouched();
  }

  formatCoordinates(): string {
    const coords = this.form.get('coordinates')?.value;
    return coords ? `[${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}]` : '';
  }

  onSubmit() {
    if (this.form.invalid) return;
    const { author, comment, rating, coordinates } = this.form.value;
    this.submitReview.emit({ author, comment, rating, coordinates });
  }
}
