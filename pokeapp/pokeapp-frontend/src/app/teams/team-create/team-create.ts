import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamsService, Team } from '../../services/teams.service/teams.service';
import { PokeappService } from '../../services/pokeapp.service/pokeapp-service';
import { AuthService } from '../../services/auth.service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team-create',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './team-create.html',
  styleUrls: ['./team-create.css']
})
export class TeamCreate implements OnInit {
  teamForm: FormGroup;
  isEditing = false;
  teamId?: string;
  selectedPokemons: any[] = [];
  selectedTags: string[] = [];
  availableTags: string[] = [];

  // Para el selector de Pokémon
  showPokemonSelector = false;
  allPokemons: any[] = [];
  filteredPokemons: any[] = [];
  searchTerm = '';

  constructor(
    private fb: FormBuilder,
    private teamsService: TeamsService,
    private pokeappService: PokeappService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      isPublic: [true]
    });

    this.availableTags = this.teamsService.getPopularTags();
  }

  ngOnInit() {
    // Cargar todos los Pokémon
    this.pokeappService.loadAllPokemons();
    this.allPokemons = this.pokeappService.pokemons();
    this.filteredPokemons = [...this.allPokemons];

    // Verificar si estamos editando
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.teamId = params['id'];
        this.loadTeamForEdit();
      }
    });
  }

  loadTeamForEdit() {
    this.teamsService.getTeamById(this.teamId!).subscribe({
      next: (response) => {
        const team = response.data;
        this.teamForm.patchValue({
          name: team.name,
          description: team.description || '',
          isPublic: team.isPublic
        });
        this.selectedPokemons = team.pokemons;
        this.selectedTags = team.tags || [];
      },
      error: (err) => {
        console.error('Error cargando equipo:', err);
        this.router.navigate(['/teams']);
      }
    });
  }

  openPokemonSelector() {
    if (this.selectedPokemons.length >= 6) {
      alert('Máximo 6 Pokémon por equipo');
      return;
    }
    this.showPokemonSelector = true;
  }

  closePokemonSelector() {
    this.showPokemonSelector = false;
    this.searchTerm = '';
    this.filterPokemons();
  }

  filterPokemons() {
    if (!this.searchTerm) {
      this.filteredPokemons = [...this.allPokemons];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredPokemons = this.allPokemons.filter(p =>
        p.name.english.toLowerCase().includes(term) ||
        p.name.japanese.toLowerCase().includes(term) ||
        p.id.toString().includes(term)
      );
    }
  }

  selectPokemon(pokemon: any) {
    if (this.selectedPokemons.length >= 6) {
      alert('Máximo 6 Pokémon por equipo');
      return;
    }

    // Verificar si ya está en el equipo
    if (this.selectedPokemons.some(p => p.pokemonId === pokemon.id)) {
      alert('Este Pokémon ya está en tu equipo');
      return;
    }

    this.selectedPokemons.push({
      pokemonId: pokemon.id,
      name: pokemon.name.english,
      sprite: pokemon.image.sprite || pokemon.image.thumbnail
    });

    this.closePokemonSelector();
  }

  removePokemon(index: number) {
    this.selectedPokemons.splice(index, 1);
  }

  toggleTag(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index === -1) {
      this.selectedTags.push(tag);
    } else {
      this.selectedTags.splice(index, 1);
    }
  }

  addCustomTag(event: any) {
    const tag = event.target.value.trim();
    if (tag && !this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
      event.target.value = '';
    }
  }

  onSubmit() {
    if (this.teamForm.invalid || this.selectedPokemons.length === 0) {
      alert('Completa todos los campos requeridos');
      return;
    }

    const teamData = {
      ...this.teamForm.value,
      pokemons: this.selectedPokemons,
      tags: this.selectedTags
    };

    const request = this.isEditing
      ? this.teamsService.updateTeam(this.teamId!, teamData)
      : this.teamsService.createTeam(teamData);

    request.subscribe({
      next: (response) => {
        alert(this.isEditing ? 'Equipo actualizado!' : 'Equipo creado!');
        this.router.navigate(['/teams', response.data._id || this.teamId]);
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Error: ' + (err.error?.error || 'Error del servidor'));
      }
    });
  }

  cancel() {
    if (confirm('¿Seguro que quieres cancelar? Los cambios no se guardarán.')) {
      this.router.navigate(['/teams']);
    }
  }
}
