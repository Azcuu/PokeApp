import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


import { TeamsService } from '../../services/teams.service/teams.service';

type PokemonApi = {
  id: number;
  name: { english: string; japanese?: string };
  type: string[];
  image: { sprite?: string; thumbnail?: string };
};

type SelectedPokemon = {
  pokemonId: number;
  name: string;
  sprite: string;
};

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './team-create.html',
  styleUrls: ['./team-create.css']
})
export class TeamCreate implements OnInit {
  teamForm: FormGroup;
  isEditing = false;
  teamId?: string;

  selectedPokemons: SelectedPokemon[] = [];
  selectedTags: string[] = [];

  availableTags: string[] = [
    'Competitivo','Shiny','Legendario','Starter','Monotype','Balanceado','Ofensivo','Defensivo','Rápido','Trick Room'
  ];

  showPokemonSelector = false;
  allPokemons: PokemonApi[] = [];
  filteredPokemons: PokemonApi[] = [];
  searchTerm = '';

  loadingPokemons = true;
  errorPokemons = '';

  private pokemonsUrl = 'http://localhost:3000/pokemons';

  constructor(
    private fb: FormBuilder,
    private teamsService: TeamsService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {

    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadAllPokemons();

    this.route.params.subscribe((params: any) => {
      if (params['id']) {
        this.isEditing = true;
        this.teamId = params['id'];
        this.loadTeamForEdit();
      }
    });
  }

  get emptySlots(): number[] {
    const n = Math.max(0, 6 - this.selectedPokemons.length);
    return Array.from({ length: n }, (_, i) => i);
  }

  pokemonCardSprite(p: PokemonApi): string {
    return p?.image?.sprite || p?.image?.thumbnail || '';
  }

  private loadAllPokemons(): void {
    this.loadingPokemons = true;
    this.errorPokemons = '';
    this.cdr.detectChanges();

    this.http.get<PokemonApi[]>(this.pokemonsUrl).subscribe({
      next: (list: PokemonApi[]) => {
        this.allPokemons = Array.isArray(list) ? list : [];
        this.filteredPokemons = [...this.allPokemons];
        this.loadingPokemons = false;
        this.cdr.detectChanges();
      },
      error: (e: any) => {
        console.error('Error cargando pokemons:', e);
        this.loadingPokemons = false;
        this.errorPokemons = 'No se pudieron cargar los Pokémon';
        this.cdr.detectChanges();
      }
    });
  }

  private loadTeamForEdit(): void {
    if (!this.teamId) return;

    this.teamsService.getTeamById(this.teamId).subscribe({
      next: (response: any) => {
        const team = response?.data;

        this.teamForm.patchValue({
          name: team?.name || '',
          description: team?.description || ''
        });

        this.selectedPokemons = (team?.pokemons || []).map((p: any) => ({
          pokemonId: p.pokemonId,
          name: p.name,
          sprite: p.sprite
        }));

        this.selectedTags = Array.isArray(team?.tags) ? team.tags : [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando equipo:', err);
        this.router.navigate(['/teams']);
      }
    });
  }


  openPokemonSelector(): void {
    if (this.selectedPokemons.length >= 6) {
      alert('Máximo 6 Pokémon por equipo');
      return;
    }
    this.showPokemonSelector = true;
    this.filterPokemons();
    this.cdr.detectChanges();
  }

  closePokemonSelector(): void {
    this.showPokemonSelector = false;
    this.searchTerm = '';
    this.filterPokemons();
    this.cdr.detectChanges();
  }


  filterPokemons(): void {
    const raw = this.searchTerm.trim().toLowerCase();

    if (!raw) {
      this.filteredPokemons = [...this.allPokemons];
      return;
    }


    const term = raw.startsWith('#') ? raw.slice(1) : raw;


    const isNumeric = /^[0-9]+$/.test(term);

    if (isNumeric) {
      this.filteredPokemons = this.allPokemons.filter((p: PokemonApi) =>
        String(p.id).includes(term)
      );
      return;
    }


    this.filteredPokemons = this.allPokemons.filter((p: PokemonApi) => {
      const en = (p?.name?.english || '').toLowerCase();
      const jp = (p?.name?.japanese || '').toLowerCase();
      return en.includes(term) || jp.includes(term);
    });
  }

  selectPokemon(pokemon: PokemonApi): void {
    if (this.selectedPokemons.length >= 6) {
      alert('Máximo 6 Pokémon por equipo');
      return;
    }

    if (this.selectedPokemons.some(p => p.pokemonId === pokemon.id)) {
      alert('Este Pokémon ya está en tu equipo');
      return;
    }

    this.selectedPokemons.push({
      pokemonId: pokemon.id,
      name: pokemon.name.english,
      sprite: pokemon.image?.sprite || pokemon.image?.thumbnail || ''
    });

    this.closePokemonSelector();
  }

  removePokemon(index: number): void {
    this.selectedPokemons.splice(index, 1);
    this.cdr.detectChanges();
  }

  toggleTag(tag: string): void {
    const idx = this.selectedTags.indexOf(tag);
    if (idx === -1) this.selectedTags.push(tag);
    else this.selectedTags.splice(idx, 1);
    this.cdr.detectChanges();
  }

  addCustomTag(event: any): void {
    const tag = String(event?.target?.value || '').trim();
    if (tag && !this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
      event.target.value = '';
      this.cdr.detectChanges();
    }
  }

  onSubmit(): void {
    if (this.teamForm.invalid) {
      alert('Pon un nombre válido');
      return;
    }
    if (this.selectedPokemons.length === 0) {
      alert('Añade al menos 1 Pokémon');
      return;
    }

    const baseData = {
      name: this.teamForm.value.name,
      description: this.teamForm.value.description,
      tags: this.selectedTags
    };

    if (!this.isEditing) {
      const teamData = {
        ...baseData,
        pokemonIds: this.selectedPokemons.map(p => p.pokemonId)
      };

      this.teamsService.createTeam(teamData).subscribe({
        next: (res: any) => {
          alert('¡Equipo creado!');
          const id = res?.data?._id;
          this.router.navigate(id ? ['/teams', id] : ['/teams']);
        },
        error: (err: any) => {
          console.error('Error creando team:', err);
          alert('Error: ' + (err.error?.error || 'Error del servidor'));
        }
      });
      return;
    }




const updateData = {
  name: this.teamForm.value.name,
  description: this.teamForm.value.description,
  tags: this.selectedTags,
  pokemonIds: this.selectedPokemons.map(p => p.pokemonId),
};

this.teamsService.updateTeam(this.teamId!, updateData).subscribe({
  next: () => {
    alert('¡Equipo actualizado!');
    this.router.navigate(['/teams', this.teamId]);
  },
  error: (err: any) => {
    console.error('Error actualizando team:', err);
    alert('Error: ' + (err.error?.error || 'Error del servidor'));
  }
});


  }

  cancel(): void {
    if (confirm('¿Seguro que quieres cancelar? Los cambios no se guardarán.')) {
      this.router.navigate(['my-teams']);
    }
  }
}
