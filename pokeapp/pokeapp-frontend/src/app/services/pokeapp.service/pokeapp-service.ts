import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Pokemon } from '../../models/pokemon.model';

@Injectable({
  providedIn: 'root'
})
export class PokeappService {
  private baseUrl = 'http://localhost:3000';

  // Señales para estado
  pokemons = signal<Pokemon[]>([]);
  loaded = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) { }

  /**
   * Carga todos los Pokémon una sola vez
   */
  loadAllPokemons(): void {
    if (this.loaded() || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.http.get<Pokemon[]>(`${this.baseUrl}/pokemons`).subscribe({
      next: (response) => {
        this.pokemons.set(Array.isArray(response) ? response : []);
        this.loaded.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading pokemons:', err);
        this.error.set('Error al cargar los Pokémon');
        this.loading.set(false);
      }
    });
  }

  /**
   * Obtiene un Pokémon por ID
   */
  getPokemonById$(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.baseUrl}/pokemons/${id}`);
  }

  /**
   * Filtra Pokémon por nombre (inglés o japonés)
   */
  searchPokemonByName(name: string): Pokemon[] {
    const searchTerm = name.toLowerCase();
    return this.pokemons().filter(pokemon =>
      pokemon.name.english.toLowerCase().includes(searchTerm) ||
      (pokemon.name.japanese?.toLowerCase().includes(searchTerm) ?? false)
    );
  }

  /**
   * Filtra Pokémon por tipo
   */
  getPokemonByType(type: string): Pokemon[] {
    return this.pokemons().filter(pokemon =>
      pokemon.type.includes(type)
    );
  }

  /**
   * Devuelve una página de Pokémon para paginación frontend
   */
  getPokemonsPage(page: number, limit: number): Pokemon[] {
    const start = (page - 1) * limit;
    return this.pokemons().slice(start, start + limit);
  }

  /**
   * Forzar recarga de Pokémon
   */
  refreshPokemons(): void {
    this.loaded.set(false);
    this.loadAllPokemons();
  }
}
