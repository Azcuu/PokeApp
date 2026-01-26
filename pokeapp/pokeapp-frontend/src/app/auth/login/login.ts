import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
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
    private router: Router
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
      return;
    }

    if (!this.isValidEmail(email)) {
      this.error = 'Email no válido';
      return;
    }

    this.loading = true;

    this.http.post<any>(this.apiUrl, { email, password })
      .subscribe({
        next: (response) => {
          this.loading = false;

          if (!response?.success || !response?.token) {
            this.error = response?.error || 'Credenciales incorrectas';
            return;
          }

          localStorage.setItem('token', response.token);

          if (response?.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('userId', response.user.id);
            localStorage.setItem('username', response.user.username);
          }

          if (this.rememberMe) {
            localStorage.setItem('savedEmail', email);
          } else {
            localStorage.removeItem('savedEmail');
          }

          this.router.navigate(['/my-teams']);
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;

          if (error.status === 401) {
            this.error = error.error?.error || 'Credenciales inválidas';
          } else if (error.status === 0) {
            this.error = 'Error de conexión. Verifica tu internet.';
          } else if (error.status >= 500) {
            this.error = 'Error del servidor. Intenta más tarde.';
          } else {
            this.error = error.error?.error || error.message || 'Error desconocido';
          }
        }
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
