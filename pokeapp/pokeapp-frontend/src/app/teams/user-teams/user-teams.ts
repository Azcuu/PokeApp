import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { TeamsService } from '../../services/teams.service/teams.service';

@Component({
  selector: 'app-user-teams',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-teams.html',
  styleUrls: ['./user-teams.css']
})
export class UserTeams implements OnInit {
  loading = true;
  error = '';
  teams: any[] = [];

  isAuthenticated = false;
  userId: string | null = null;
  username: string | null = null;

  constructor(
    private teamsService: TeamsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkAuthentication();
    if (!this.isAuthenticated) return;
    this.loadTeams();
  }

  private checkAuthentication(): void {
    const token = localStorage.getItem('token');
    this.userId = localStorage.getItem('userId');
    this.username = localStorage.getItem('username');

    this.isAuthenticated = !!token;

    if (!this.isAuthenticated) {
      this.loading = false;
      this.error = 'Debes iniciar sesión para ver tus equipos';
      this.cdr.detectChanges();
    }
  }

  reloadTeams(): void {
    this.loadTeams();
  }

  logout(): void {
    const ok = confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (!ok) return;

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');

    this.isAuthenticated = false;
    this.userId = null;
    this.username = null;
    this.teams = [];

    alert('Sesión cerrada correctamente');
    this.router.navigate(['/my-teams']);
  }

  private loadTeams(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.teamsService.getUserTeams().subscribe({
      next: (res: any) => {
        this.teams = res?.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const msg =
          err?.error?.error ||
          err?.error?.message ||
          (err?.status === 401
            ? 'Tu sesión ha caducado. Inicia sesión de nuevo.'
            : 'Error cargando tus equipos.');

        this.error = msg;
        this.loading = false;

        if (err?.status === 401) {
          this.isAuthenticated = false;
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
        }

        this.cdr.detectChanges();
      }
    });
  }

  editTeam(id: string): void {
    this.router.navigate(['/teams/edit', id]);
  }

  deleteTeam(id: string): void {
    if (!id) return;

    const ok = confirm('¿Seguro que quieres eliminar este equipo?');
    if (!ok) return;

    this.teamsService.deleteTeam(id).subscribe({
      next: () => {
        this.teams = this.teams.filter(t => t._id !== id);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        alert(err?.error?.error || 'Error eliminando el equipo');
      }
    });
  }
}
