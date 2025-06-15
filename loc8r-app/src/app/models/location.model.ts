import { Location } from '../interfaces/location.interface';
import { environment } from 'src/environments/environment';

export class LocationModel implements Location {
  id!: string;
  name!: string;
  address!: string;
  rating!: number;
  description!: string;
  tags!: string[];
  coordinates!: [number, number];
  createdOn!: string;
  imageId!: string;
  numReviews!: number;

  constructor(data: Location) {
    Object.assign(this, data); // Copia todas las propiedades directamente
  }

  get imageUrl(): string {
    if (!this.imageId) {
      return `/assets/images/no-image-default.jpg`; // URL por defecto si no hay imageId
    }
    return `${environment.apiEndpoint}/locations/image/${this.imageId}`;
  }

  get detailUrl(): string {
    return `/locations/${this.id}`;
  }

  // Puedes seguir añadiendo getters o métodos útiles aquí
}