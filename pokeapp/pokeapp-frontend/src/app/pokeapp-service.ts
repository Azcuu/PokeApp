import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pokemon } from './models/pokemon.model';

@Injectable({
  providedIn: 'root'
})

export class PokeappService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  getPokemons(): Observable<Pokemon[]> {
    return this.http.get<Pokemon[]>(`${this.apiUrl}/pokemons/`);
  }

  getPokemonById(id: string): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.apiUrl}/pokemons/${id}/`);
  }

}

