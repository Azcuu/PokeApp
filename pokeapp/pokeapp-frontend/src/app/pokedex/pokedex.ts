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

  // Señales para el estado
  loaded = signal(false);
  loading = signal(true);
  error = signal<string | null>(null);

  // Datos filtrados
  pokemons = signal<Pokemon[]>([]);
  filteredPokemons = signal<Pokemon[]>([]);

  // Filtros usando model() para two-way binding
  searchTerm = model('');
  selectedType = model('');

  // Tipos disponibles
  pokemonTypes = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
    'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic',
    'Bug', 'Rock', 'Ghost', 'Dark', 'Dragon', 'Steel', 'Fairy'
  ];

  constructor() {
    // Usar effect para reaccionar a cambios en los filtros
    effect(() => {
      // Leer los valores para que el effect se active cuando cambien
      const search = this.searchTerm();
      const type = this.selectedType();

      // Aplicar filtros
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    // Cargar Pokémon al inicializar
    this.loadPokemons();
  }

  loadPokemons(): void {
    this.loading.set(true);
    this.error.set(null);

    this.pokeappService.loadAllPokemons();

    // Verificar periódicamente si se cargaron
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

  // Navegar a detalles
  goToDetail(id: number): void {
    this.router.navigate(['/pokedex', id]);
  }

  // Aplicar filtros
  applyFilters(): void {
    let filtered = [...this.pokemons()];

    // Filtrar por búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(pokemon =>
        pokemon.name.english.toLowerCase().includes(search) ||
        pokemon.name.japanese.toLowerCase().includes(search)
      );
    }

    // Filtrar por tipo
    const type = this.selectedType();
    if (type) {
      filtered = filtered.filter(pokemon =>
        pokemon.type.includes(type)
      );
    }

    this.filteredPokemons.set(filtered);
  }

  // Limpiar filtros
  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedType.set('');
    this.filteredPokemons.set([...this.pokemons()]);
  }

  // Obtener tipo principal para estilos
  getPrimaryType(pokemon: Pokemon): string {
    return pokemon.type[0]?.toLowerCase() || 'normal';
  }

  // Formatear ID
  formatId(id: number): string {
    return id.toString().padStart(3, '0');
  }

  // Refrescar datos
  refresh(): void {
    this.pokeappService.refreshPokemons();
    this.loadPokemons();
  }

  // MANEJO DE ERRORES EN IMÁGENES - AÑADIR ESTE MÉTODO
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'; // Placeholder
  }

  // Método opcional para obtener color de tipo
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
