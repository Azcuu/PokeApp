import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsService, Team } from '../services/teams.service/teams.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teams.html',
})
export class Teams implements OnInit {
  teams: Team[] = [];
  error = '';

  constructor(private teamsService: TeamsService) {}

  ngOnInit() {
    this.teamsService.getAllTeams().subscribe({
      next: (res) => (this.teams = res.data),
      error: () => (this.error = 'No se pudieron cargar los teams')
    });
  }
}
