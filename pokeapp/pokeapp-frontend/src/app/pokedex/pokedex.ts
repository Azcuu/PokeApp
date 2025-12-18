import { Component, inject, model, signal, OnInit, effect } from '@angular/core';
import { PokeappService } from '../services/pokeapp.service/pokeapp-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../models/pokemon.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokedex.html',
  styleUrl: './pokedex.css',
})
export class Pokedex implements OnInit {
  pokeappService = inject(PokeappService);
  private router = inject(Router);

  loaded = signal(false);
  loading = signal(true);
  error = signal<string | null>(null);

  // Dades de Pokémon
  pokemons = signal<Pokemon[]>([]);
  filteredPokemons = signal<Pokemon[]>([]);

  searchTerm = model('');
  selectedType = model('');

  // Tipus de Pokémon disponibles
  pokemonTypes = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
    'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic',
    'Bug', 'Rock', 'Ghost', 'Dark', 'Dragon', 'Steel', 'Fairy'
  ];

  constructor() {
    effect(() => {
      const search = this.searchTerm();
      const type = this.selectedType();

      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.loadPokemons();
  }

  loadPokemons(): void {
    this.loading.set(true);
    this.error.set(null);

    this.pokeappService.loadAllPokemons();

  
    const checkInterval = setInterval(() => {
      if (this.pokeappService.loaded()) {
        const allPokemons = this.pokeappService.pokemons();
        this.pokemons.set(allPokemons);
        this.filteredPokemons.set([...allPokemons]);
        this.loaded.set(true);
        this.loading.set(false);
        clearInterval(checkInterval);
      }

      if (this.pokeappService.error()) {
        this.error.set(this.pokeappService.error());
        this.loaded.set(false);
        this.loading.set(false);
        clearInterval(checkInterval);
      }
    }, 100);
  }


  goToDetail(id: number): void {
    this.router.navigate(['/pokedex', id]);
  }


  applyFilters(): void {
    let filtered = [...this.pokemons()];

    
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(pokemon =>
        pokemon.name.english.toLowerCase().includes(search) ||
        pokemon.name.japanese.toLowerCase().includes(search)
      );
    }

    
    const type = this.selectedType();
    if (type) {
      filtered = filtered.filter(pokemon =>
        pokemon.type.includes(type)
      );
    }

    this.filteredPokemons.set(filtered);
  }

  
  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedType.set('');
    this.filteredPokemons.set([...this.pokemons()]);
  }

 
  getPrimaryType(pokemon: Pokemon): string {
    return pokemon.type[0]?.toLowerCase() || 'normal';
  }


  formatId(id: number): string {
    return id.toString().padStart(3, '0');
  }

 
  refresh(): void {
    this.pokeappService.refreshPokemons();
    this.loadPokemons();
  }

 
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'; 
  }

 
  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'normal': '#A8A878',
      'fire': '#F08030',
      'water': '#6890F0',
      'electric': '#F8D030',
      'grass': '#78C850',
      'ice': '#98D8D8',
      'fighting': '#C03028',
      'poison': '#A040A0',
      'ground': '#E0C068',
      'flying': '#A890F0',
      'psychic': '#F85888',
      'bug': '#A8B820',
      'rock': '#B8A038',
      'ghost': '#705898',
      'dark': '#705848',
      'dragon': '#7038F8',
      'steel': '#B8B8D0',
      'fairy': '#EE99AC'
    };
    return colors[type.toLowerCase()] || '#A8A878';
  }
}
