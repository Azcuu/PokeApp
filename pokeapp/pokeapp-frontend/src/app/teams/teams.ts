import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private teamsService: TeamsService,
    private cdr: ChangeDetectorRef  // ← Agregar esto
  ) {}

  ngOnInit() {
    console.log('Teams component initialized');
    this.loadTeams();
  }

  loadTeams() {
    console.log('Loading teams from service...');
    
    this.teamsService.getAllTeams().subscribe({
      next: (res) => {
        console.log('Response from getAllTeams:', res);
        
        if (res.success) {
          this.teams = res.data || [];
        } else if (Array.isArray(res)) {
          this.teams = res;
        } else {
          console.log('Unexpected response format:', res);
          this.teams = [];
        }
        
        console.log(`Loaded ${this.teams.length} teams`);
        this.loading = false;
        this.error = '';
        
        // FORZAR DETECCIÓN DE CAMBIOS ← ESTA ES LA CLAVE
        this.cdr.detectChanges();
        console.log('Change detection triggered');
      },
      error: (err) => {
        console.error('Error loading teams:', err);
        
        if (err.status === 0) {
          this.error = 'No se puede conectar con el backend. Asegúrate de que esté corriendo en http://localhost:3000';
        } else {
          this.error = `Error ${err.status}: ${err.message || 'No se pudieron cargar los equipos'}`;
        }
        this.loading = false;
        this.cdr.detectChanges(); // ← También aquí
      }
    });
  }

  reloadTeams() {
    this.loading = true;
    this.error = '';
    this.loadTeams();
  }
}