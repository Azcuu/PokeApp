import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard/auth.guard';

export const routes: Routes = [
  // Home
  {
    path: '',
    loadComponent: () => import('./home/home').then(m => m.Home),
    title: 'Home'
  },
  // Pokédex
  {
    path: 'pokedex',
    loadComponent: () => import('./pokedex/pokedex').then(m => m.Pokedex),
    title: 'Pokédex'
  },
  {
    path: 'pokedex/:id',
    loadComponent: () => import('./pokemon-details/pokemon-details').then(m => m.PokemonDetails),
    title: 'Detalles Pokémon'
  },
  // Pokedle
  {
    path: 'pokedle',
    loadComponent: () => import('./pokedle/pokedle').then(m => m.Pokedle),
    title: 'Pokedle'
  },
  // Auth
  {
  path: 'login',
  loadComponent: () => import('./auth/login/login').then(m => m.Login),
  title: 'Login'
},

{
  path: 'register',
  loadComponent: () => import('./auth/register/register').then(m => m.Register),
  title: 'Register'
},

  // Teams
  {
    path: 'teams/create',
    loadComponent: () => import('./teams/team-create/team-create').then(m => m.TeamCreate),
    canActivate: [AuthGuard],
    title: 'Create Team'
  },
  {
    path: 'teams/edit/:id',
    loadComponent: () => import('./teams/team-edit/team-edit').then(m => m.TeamEdit),
    canActivate: [AuthGuard],
    title: 'Edit Team'
  },
  {
  path: 'teams',
  loadComponent: () => import('./teams/teams').then(m => m.Teams),
  title: 'Teams'
  },
  {
    path: 'teams/:id',
    loadComponent: () => import('./team-details/team-detail').then(m => m.TeamDetail),
    title: 'Team Details'
  },
];
