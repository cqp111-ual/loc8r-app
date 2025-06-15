import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError, timeout, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse, PaginatedResults, Review } from '../interfaces/location.interface';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiEndpoint}`;

  constructor(private http: HttpClient) {}

  getReviews(locationId: string, page: number = 0, limit: number = 10): Observable<PaginatedResults<Review>> {
    const offset = page * limit;
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());
  
    return this.http.get<ApiResponse<PaginatedResults<Review>>>(`${this.apiUrl}/locations/${locationId}/reviews`, { params }).pipe(
      timeout(5000),
      catchError(err => {
        console.error('Error cargando reviews', err);
        return throwError(() => new Error('Error cargando reviews'));
      }),
      map(response => {
        console.log('[ReviewService] Raw response:', response);

        const paginated = response.data ?? { total: 0, limit, offset, results: [] };
        return {
          total: paginated.total,
          limit: paginated.limit,
          offset: paginated.offset,
          results: paginated.results.map(review => ({
            ...review,
          }))
        };
      })
    );
  }

  insertReview(locationId: string, review: {
    author: string,
    reviewText: string,
    rating: number,
    coordinates: number[]
  }): Observable<boolean> {
    return this.http.post(`${this.apiUrl}/locations/${locationId}/reviews`, review, { observe: 'response' }).pipe(
      timeout(5000),
      map(response => {
        // Si el status es 201 (Created) o 200 OK, devolvemos true, si no, false
        return response.status === 201 || response.status === 200;
      }),
      catchError(err => {
        console.error('Error insertando review', err);
        return of(false);
      })
    );
  }

  deleteReview(locationId: string, reviewId: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/locations/${locationId}/reviews/${reviewId}`, { observe: 'response' }).pipe(
      timeout(5000),
      map(response => {
        // Éxito si status es 200 OK o 204 No Content
        return response.status === 200 || response.status === 204;
      }),
      catchError(err => {
        console.error('Error eliminando review', err);
        return of(false);
      })
    );
  }
  

}
