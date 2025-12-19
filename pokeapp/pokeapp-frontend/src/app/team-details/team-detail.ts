import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TeamsService, Team, PokemonInTeam } from '../services/teams.service/teams.service';
import { Title } from '@angular/platform-browser';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './team-detail.html',
  styleUrls: ['./team-detail.css']
})
export class TeamDetails implements OnInit {
  teamId: string = '';
  team: Team | null = null;
  loading = true;
  error = '';
  isOwner = false;

  uniqueTypes = 0;
  legendaryCount = 0;
  mythicalCount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamsService: TeamsService,
    private cdr: ChangeDetectorRef,
    private titleService: Title,
    private clipboard: Clipboard
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.teamId = params['id'];
      if (this.teamId) {
        this.loadTeam();
      } else {
        this.error = 'ID de equipo no válido';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTeam() {
    this.loading = true;
    this.error = '';

    console.log(`Loading team details for ID: ${this.teamId}`);

    this.teamsService.getTeamById(this.teamId).subscribe({
      next: (res) => {
        console.log('Team details response:', res);

        if (res.success && res.data) {
          this.team = res.data;
          this.titleService.setTitle(`PokéTeams - ${this.team.name}`);
          this.checkOwnership();
          this.calculateStats();

          console.log('Team loaded successfully:', this.team);
          if (this.team.pokemons && this.team.pokemons.length > 0) {
            console.log('Sample pokemon data:', this.team.pokemons[0]);
          }
        } else {
          this.error = 'Equipo no encontrado';
          console.log('Team not found or invalid response:', res);
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading team details:', err);

        if (err.status === 404) {
          this.error = 'Equipo no encontrado';
        } else if (err.status === 0) {
          this.error = 'No se puede conectar con el servidor';
        } else {
          this.error = `Error ${err.status}: No se pudo cargar el equipo`;
        }

        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  checkOwnership() {
    if (!this.team) return;

    const currentUserId = localStorage.getItem('userId');
    const teamCreatorId = this.team.creator?._id || '';

    this.isOwner = currentUserId === teamCreatorId;
    console.log('Ownership check:', { currentUserId, teamCreatorId, isOwner: this.isOwner });
  }

  calculateStats() {
    if (!this.team || !this.team.pokemons) return;

    const allTypes = new Set<string>();
    this.team.pokemons.forEach(pokemon => {
      const types = this.getPokemonTypes(pokemon);
      types.forEach(type => allTypes.add(type));
    });
    this.uniqueTypes = allTypes.size;

    const legendaryIds = [144, 145, 146, 150, 151, 243, 244, 245, 249, 250];
    const mythicalIds = [151, 251, 385, 386, 489, 490, 491, 492, 493];

    this.legendaryCount = this.team.pokemons.filter(p =>
      legendaryIds.includes(p.pokemonId)
    ).length;

    this.mythicalCount = this.team.pokemons.filter(p =>
      mythicalIds.includes(p.pokemonId)
    ).length;
  }

  getPokemonStatValue(pokemon: any, statName: string): number {

  const statMap: { [key: string]: keyof typeof pokemon.base } = {
      'HP': 'HP',
      'Ataque': 'Attack',
      'Defensa': 'Defense',
      'Ataque Especial': 'Sp. Attack',
      'Defensa Especial': 'Sp. Defense',
      'Velocidad': 'Speed'
    };

    return pokemon.base[statMap[statName]] || 0;
  }

  getPokemonTypes(pokemon: any): string[] {
   return pokemon.type;
  }

  getStatPercentage(value: number, statName: string): number {
    const maxStats: { [key: string]: number } = {
      'HP': 255,
      'Ataque': 190,
      'Defensa': 230,
      'Ataque Especial': 194,
      'Defensa Especial': 230,
      'Velocidad': 180
    };

    const max = maxStats[statName] || 100;
    return Math.min((value / max) * 100, 100);
  }

  getStatColor(statName: string): string {
    const colorMap: { [key: string]: string } = {
      'HP': '#ef4444',
      'Ataque': '#f59e0b',
      'Defensa': '#10b981',
      'Ataque Especial': '#3b82f6',
      'Defensa Especial': '#8b5cf6',
      'Velocidad': '#ec4899'
    };

    return colorMap[statName] || '#3b82f6';
  }

  viewPokemonDetails(pokemonId: number) {
    window.open(`http://localhost:4200/pokedex/${pokemonId}`, '_blank');
  }

  removePokemon(pokemon: PokemonInTeam) {
    if (!this.isOwner || !this.team) return;

    if (confirm(`¿Quitar a ${pokemon.name} del equipo?`)) {
      console.log(`Removing pokemon ${pokemon.pokemonId} from team`);
      alert(`Se quitó a ${pokemon.name} del equipo (en una app real, esto actualizaría la base de datos)`);
    }
  }

  deleteTeam() {
    if (!this.isOwner || !this.team) return;

    if (confirm(`¿Estás seguro de eliminar el equipo "${this.team.name}"? Esta acción no se puede deshacer.`)) {
      this.teamsService.deleteTeam(this.teamId).subscribe({
        next: () => {
          alert('Equipo eliminado correctamente');
          this.router.navigate(['/teams']);
        },
        error: (err) => {
          console.error('Error deleting team:', err);
          alert('Error al eliminar el equipo');
        }
      });
    }
  }

  shareTeam() {
    if (!this.team) return;

    const url = window.location.href;
    const text = `¡Mira mi equipo Pokémon "${this.team.name}" en PokéTeams!`;

    if (navigator.share) {
      navigator.share({
        title: this.team.name,
        text: text,
        url: url
      });
    } else {
      this.copyTeamLink();
    }
  }

  copyTeamLink() {
    const url = window.location.href;
    this.clipboard.copy(url);
    alert('Enlace copiado al portapapeles');
  }

  reload() {
    this.loadTeam();
  }
}
