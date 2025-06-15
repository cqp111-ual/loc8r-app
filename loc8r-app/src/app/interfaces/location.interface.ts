import { INJECTOR } from "@angular/core";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResults<T> {
  total: number;
  limit: number;
  offset: number;
  results: T[];
}

export interface Location {
  id: string;
  name: string;
  address: string;
  rating: number;
  description: string;
  tags: string[];
  coordinates: [number, number];
  createdOn: string;
  imageId: string;
  numReviews: number;
}

export interface LocationFSQ {
  id: string;
  name: string;
  address: string;
  rating: number;
  description: string;
  tags: string[];
  coordinates: [number, number];
  imageUrl: string;
}

export interface ImportResponse {
  inserted: string[];
  failed: string[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  reviewText: string;
  createdOn: string;
  coordinates: [number, number];
}

export interface ReviewDetails extends Review {}

export interface LocationDetails extends Location {}