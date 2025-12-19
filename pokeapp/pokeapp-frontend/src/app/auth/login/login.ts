import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  rememberMe = false;
  error = '';
  loading = false;
  showPassword = false;

  private apiUrl = 'http://localhost:3000/user/login';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }

  login() {
    this.error = '';
    const email = this.email.trim();
    const password = this.password;

    if (!email || !password) {
      this.error = 'Introduce email y contraseña';
      this.cdr.detectChanges();
      return;
    }

    if (!this.isValidEmail(email)) {
      this.error = 'Email no válido';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.http.post<any>(this.apiUrl, { email, password })
      .subscribe({
        next: (response) => {
          console.log('Respuesta recibida:', response);

          this.ngZone.run(() => {
            this.loading = false;
            this.cdr.detectChanges();
          });

          if (!response?.success || !response?.token) {
            this.error = response?.error || 'Credenciales incorrectas';
            this.cdr.detectChanges();
            return;
          }

          localStorage.setItem('token', response.token);
          if (response?.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('username', response.user.username);
          }

          if (this.rememberMe) {
            localStorage.setItem('savedEmail', email);
          } else {
            localStorage.removeItem('savedEmail');
          }

          setTimeout(() => {
            this.router.navigate(['/my-teams']);
          }, 100);
        },
        error: (error: HttpErrorResponse) => {
          console.log('Error recibido:', error);

          this.ngZone.run(() => {
            this.loading = false;
            this.cdr.detectChanges();

            if (error.status === 401) {
              this.error = error.error?.error || 'Credenciales inválidas';
            }
            else if (error.status === 0) {
              this.error = 'Error de conexión. Verifica tu internet.';
            }
            else if (error.status >= 500) {
              this.error = 'Error del servidor. Intenta más tarde.';
            }
            else {
              this.error = error.error?.error || error.message || 'Error desconocido';
            }

            this.cdr.detectChanges();
          });
        }
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    this.cdr.detectChanges();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
