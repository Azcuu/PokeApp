import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeamsService, Team } from '../services/teams.service/teams.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teams.html',
  styleUrl: './teams.css',
})
export class Teams implements OnInit {
  teams: Team[] = [];
  loading = true;
  error = '';

  constructor(private teamsService: TeamsService) {}

  ngOnInit() {
    this.teamsService.getAllTeams().subscribe({
      next: (res) => {
        this.teams = res.data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los equipos';
        this.loading = false;
      }
    });
  }
}
