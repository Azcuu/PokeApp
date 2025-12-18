import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamCreate } from '../team-create/team-create';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  imports: [CommonModule, TeamCreate],
  templateUrl: './team-edit.html',
  styleUrl: './team-edit.css',
})
export class TeamEdit {}
