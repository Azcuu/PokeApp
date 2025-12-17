import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  error = '';
  loading = false;

  private apiUrl = 'http://localhost:3000/user/login';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.error = '';
    const u = this.username.trim();
    const p = this.password;

    if (!u || !p) {
      this.error = 'Pon usuario y contraseña';
      return;
    }

    this.loading = true;

    this.http.post<any>(this.apiUrl, { username: u, password: p }).subscribe({
      next: (res) => {
        this.loading = false;

        if (!res?.success) {
          this.error = 'Login incorrecto';
          return;
        }

        const token = res?.token;
        if (!token) {
          this.error = 'El servidor no devolvió token';
          return;
        }

        localStorage.setItem('token', token);
        if (res?.user) localStorage.setItem('user', JSON.stringify(res.user));

        this.router.navigate(['/']);
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.error || e?.error?.message || 'Error al hacer login';
      }
    });
  }
}
