import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, user } from '@angular/fire/auth';
import { BehaviorSubject, firstValueFrom, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth); 
  private user$ = new BehaviorSubject<User | null>(null);

  constructor() { 
    user(this.auth).subscribe((firebaseUser) => {
      this.user$.next(firebaseUser); 
    });
  }

  async login(email: string, password: string) { 
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    this.user$.next(userCredential.user);
    return userCredential;
  }

  async logout() { 
    await this.auth.signOut();
    this.user$.next(null);
  }

  async register(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    this.user$.next(userCredential.user);
    return userCredential;
  }

  // Exponemos un observable público SOLO de lectura (no permite next)
  get userObservable$(): Observable<User | null> {
    return this.user$.asObservable();
  }

  async getCurrentUser(): Promise<User | null> { 
    return firstValueFrom(this.user$);
  }

  // Método booleano para componentes
  isLoggedIn(): boolean {
    return !!this.user$.value;
  }

  // Observable para plantillas
  get isLoggedIn$(): Observable<boolean> {
    return this.user$.asObservable().pipe(map(user => !!user));
  }

  getUserEmail(): string | null {
    return this.user$.value?.email ?? null;
  }
}
