import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeamsService, Team } from '../services/teams.service/teams.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teams.html',
  styleUrls: ['./teams.css'],
})
export class Teams implements OnInit {
  teams: Team[] = [];
  loading = true;
  error = '';

  constructor(private teamsService: TeamsService) {}

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.teamsService.getAllTeams().subscribe({
      next: (res) => {
        // Respuesta esperada: { success: true, data: Team[] }
        // o directamente Team[]
        this.teams = Array.isArray(res) ? res : res.data || [];
        this.loading = false;
        this.error = '';
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 0) {
          this.error =
            'No se puede conectar con el backend. Asegúrate de que esté corriendo en http://localhost:3000';
        } else {
          this.error = `Error ${err.status}: ${err.message || 'No se pudieron cargar los equipos'}`;
        }
      },
    });
  }

  reloadTeams() {
    this.loading = true;
    this.error = '';
    this.loadTeams();
  }
}
