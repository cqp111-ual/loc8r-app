import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, map, timeout } from 'rxjs/operators';
import { ApiResponse, PaginatedResults, Location, LocationFSQ, ImportResponse } from '../interfaces/location.interface';
import { LocationModel } from '../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = `${environment.apiEndpoint}/locations`;
  private fsqApiUrl = `${environment.apiEndpoint}/foursquare/locations`;

  constructor(private http: HttpClient) {}

  getLocations(
    search: string = '',
    limit: number = 10,
    offset: number = 0,
    searchBy?: 'name' | 'date' | 'coordinates',
    sort?: 'name' | 'rating' | 'date',
    order?: 'asc' | 'desc'
  ): Observable<PaginatedResults<LocationModel>> {
    const params: any = {
      q: search,
      limit: limit.toString(),
      offset: offset.toString(),
    };
  
    if (searchBy) params.searchBy = searchBy;
    if (sort) params.sort = sort;
    if (order) params.order = order;
  
    return this.http.get<ApiResponse<PaginatedResults<Location>>>(this.apiUrl, { params }).pipe(
      map(response => {
        const paginated = response.data ?? { total: 0, limit, offset, results: [] };
        return {
          total: paginated.total,
          limit: paginated.limit,
          offset: paginated.offset,
          results: paginated.results.map(loc => new LocationModel(loc))
        };
      })
    );
  }
 
  
  getLocationById(id: string): Observable<LocationModel> {
    return this.http.get<ApiResponse<Location>>(`${this.apiUrl}/${id}`).pipe(
      map(response => new LocationModel(response.data))
    );
  }

  createLocation(data: {
    name: string;
    address: string;
    description: string;
    coordinates: string;
    tags: string;
    imageUrl: string;
    imageFile: File | null;
  }): Observable<LocationModel> {
    const formData = new FormData();
  
    formData.append('name', data.name);
    formData.append('address', data.address);
    formData.append('description', data.description);
    formData.append('coordinates', data.coordinates);
  
    if (data.tags && data.tags.trim() !== '') {
      formData.append('tags', data.tags);
    }
  
    if (data.imageFile) {
      formData.append('imageFile', data.imageFile, data.imageFile.name);
    } else if (data.imageUrl && data.imageUrl.trim() !== '') {
      formData.append('imageUrl', data.imageUrl);
    }
  
    return this.http.post<ApiResponse<Location>>(`${this.apiUrl}`, formData).pipe(
      map(response => new LocationModel(response.data))
    );
  }

  updateLocation(id: string, data: {
    name?: string;
    address?: string;
    description?: string;
    coordinates?: string;
    tags?: string;
    imageUrl?: string;
    imageFile?: File | null;
  }): Observable<LocationModel> {
    const formData = new FormData();
  
    // Añadimos sólo los campos que estén definidos y no vacíos
    if (data.name && data.name.trim() !== '') {
      formData.append('name', data.name);
    }
    if (data.address && data.address.trim() !== '') {
      formData.append('address', data.address);
    }
    if (data.description && data.description.trim() !== '') {
      formData.append('description', data.description);
    }
    if (data.coordinates && data.coordinates.trim() !== '') {
      formData.append('coordinates', data.coordinates);
    }
    if (data.tags && data.tags.trim() !== '') {
      formData.append('tags', data.tags);
    }
    if (data.imageFile) {
      formData.append('imageFile', data.imageFile, data.imageFile.name);
    } else if (data.imageUrl && data.imageUrl.trim() !== '') {
      formData.append('imageUrl', data.imageUrl);
    }
  
    if ((formData as any).keys().next().done) {
      // No hay campos en el formData, lanzamos error o devolvemos un observable con error
      return throwError(() => new Error('No se ha proporcionado ningún dato para actualizar'));
    }
  
    return this.http.put<ApiResponse<Location>>(`${this.apiUrl}/${id}`, formData).pipe(
      map(response => new LocationModel(response.data))
    );
  }

  // Buscar locations en Foursquare
  searchFSQ(filters: any): Observable<LocationFSQ[]> {
    let params = new HttpParams();

    if (filters.query) {
      params = params.set('q', filters.query);
    }

    if (filters.coordinates) {
      const coords = JSON.stringify([
        filters.coordinates.lat,
        filters.coordinates.lng,
      ]);
      params = params.set('coordinates', coords);
    }

    if (filters.radius) {
      params = params.set('radius', filters.radius.toString());
    }

    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
  
    return this.http
    .get<ApiResponse<{ results: LocationFSQ[] }>>(this.fsqApiUrl, { params })
    .pipe(
      map((response) => {
        const results = response.data?.results ?? [];
        return results.map((loc) => ({
          ...loc,
          imageUrl: loc.imageUrl && loc.imageUrl.trim() !== ''
            ? loc.imageUrl
            : '/assets/images/no-image-default.jpg'
        }));
      })
    );
  }

  // Importar locations desde Foursquare
  importFSQ(fsqIds: string[]): Observable<ImportResponse> {
    const payload = { fsq_ids: fsqIds };

    return this.http
      .post<ApiResponse<ImportResponse>>(`${this.fsqApiUrl}/import`, payload)
      .pipe(
        map((response) => ({
          inserted: response.data?.inserted ?? [],
          failed: response.data?.failed ?? [],
        }))
      );
  }

  // Borrar location
  deleteLocation(locationId: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${locationId}`, { observe: 'response' }).pipe(
      timeout(5000),
      map(response => response.status === 200 || response.status === 204),
      catchError(err => {
        console.error('Error eliminando ubicación', err);
        return of(false);
      })
    );
  }
  
}
