// register.ts - VERSIÓN CON ChangeDetectorRef
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;

  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = 0;

  loading = false;
  error = '';
  successMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  submit() {
    this.error = '';
    this.successMessage = '';

    const u = this.username.trim();
    const e = this.email.trim();
    const p = this.password;
    const c = this.confirmPassword;

    if (!u || !e || !p || !c) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    if (!this.acceptTerms) {
      this.error = 'Debes aceptar los términos y condiciones';
      return;
    }

    if (!this.isValidEmail(e)) {
      this.error = 'Email no válido';
      return;
    }

    if (p !== c) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (p.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.passwordStrength < 40) {
      this.error = 'La contraseña es demasiado débil';
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.auth.register(u, e, p)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.cdr.detectChanges();

          if (res?.success === false || !res?.success) {
            this.error = res?.error || res?.message || 'No se pudo registrar';
            this.cdr.detectChanges();
            return;
          }

          this.successMessage = '¡Cuenta creada exitosamente!';
          this.cdr.detectChanges();

          setTimeout(() => {
            if (res.token) {
              localStorage.setItem('token', res.token);
              this.router.navigate(['/my-teams']);
            } else {
              this.router.navigate(['/login']);
            }
          }, 2000);
        },
        error: (err) => {
          this.loading = false;
          this.cdr.detectChanges();

          this.error = err?.error?.error ||
            err?.error?.message ||
            err?.message ||
            'Error al registrarse';

          if (err?.error?.error?.includes('ya registrado')) {
            this.error = 'Usuario o email ya registrado';
          }

          this.cdr.detectChanges();
        }
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    this.cdr.detectChanges();
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
    this.cdr.detectChanges();
  }

  checkPasswordStrength() {
    const password = this.password;
    let strength = 0;

    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 10;

    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 30;

    this.passwordStrength = Math.min(strength, 100);
    this.cdr.detectChanges();
  }

  getStrengthColor(): string {
    if (this.passwordStrength < 40) return '#e74c3c';
    if (this.passwordStrength < 70) return '#f39c12';
    return '#2ecc71';
  }

  getStrengthText(): string {
    if (this.passwordStrength < 40) return 'Débil';
    if (this.passwordStrength < 70) return 'Moderada';
    return 'Fuerte';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
