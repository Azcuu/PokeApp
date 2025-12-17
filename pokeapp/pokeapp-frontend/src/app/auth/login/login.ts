// login.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
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

  constructor(private http: HttpClient, private router: Router) {
    // Cargar email guardado si "recordarme" estaba activado
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }

  login() {
    this.error = '';
    const e = this.email.trim();
    const p = this.password;

    if (!e || !p) {
      this.error = 'Introduce email y contraseña';
      return;
    }

    if (!this.isValidEmail(e)) {
      this.error = 'Email no válido';
      return;
    }

    this.loading = true;

    this.http.post<any>(this.apiUrl, { email: e, password: p })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          if (!res?.success || !res?.token) {
            this.error = res?.error || 'Login incorrecto';
            return;
          }

          // Guardar token y usuario
          localStorage.setItem('token', res.token);
          if (res?.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
            localStorage.setItem('username', res.user.username);
          }

          // Guardar email si "recordarme" está activado
          if (this.rememberMe) {
            localStorage.setItem('savedEmail', e);
          } else {
            localStorage.removeItem('savedEmail');
          }

          this.router.navigate(['/teams']);
        },
        error: (e) => {
          console.error('Login error:', e);
          this.error = e?.error?.error ||
                      e?.error?.message ||
                      'Usuario o contraseña incorrectos';
        }
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    const passwordInput = document.querySelector('[name="password"]') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.showPassword ? 'text' : 'password';
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
