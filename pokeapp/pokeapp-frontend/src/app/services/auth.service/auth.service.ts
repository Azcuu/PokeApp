import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:3000/user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private token: string | null = null;

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token) this.token = token;
    if (userStr) this.currentUserSubject.next(JSON.parse(userStr));
  }


  register(username: string, email: string, password?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { username, email, password });
  }


  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  private handleAuthResponse(res: AuthResponse) {
    if (res?.success && res?.token) {
      this.token = res.token;
      this.currentUserSubject.next(res.user);

      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
  }

  logout() {
    this.token = null;
    this.currentUserSubject.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  authHeaders(): HttpHeaders {
    const t = this.token || localStorage.getItem('token');
    return new HttpHeaders(t ? { Authorization: `Bearer ${t}` } : {});
  }
}
