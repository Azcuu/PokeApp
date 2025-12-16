import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Pokemon, PokemonsResponse } from './models/pokemon.model';

@Injectable({
  providedIn: 'root'
})
export class PokeappService {
  private baseUrl = 'http://localhost:3000';

  pokemons = signal<Pokemon[]>([]);
  loaded = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) { }

  loadAllPokemons(): void {
    if (this.loaded() || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.http.get<PokemonsResponse>(`${this.baseUrl}/pokemons`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.pokemons.set(response.data);
          this.loaded.set(true);
        } else {
          this.error.set('Error en la respuesta del servidor');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading pokemons:', err);
        this.error.set('Error al cargar los Pokémon');
        this.loading.set(false);
      }
    });
  }

  getPokemonById$(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.baseUrl}/pokemons/${id}`);
  }

  // Para búsqueda/filtrado
  searchPokemonByName(name: string): Pokemon[] {
    const searchTerm = name.toLowerCase();
    return this.pokemons().filter(pokemon =>
      pokemon.name.english.toLowerCase().includes(searchTerm) ||
      pokemon.name.japanese.toLowerCase().includes(searchTerm)
    );
  }

  getPokemonByType(type: string): Pokemon[] {
    return this.pokemons().filter(pokemon =>
      pokemon.type.includes(type)
    );
  }

  // Refrescar datos
  refreshPokemons(): void {
    this.loaded.set(false);
    this.loadAllPokemons();
  }
}
