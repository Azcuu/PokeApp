import { Component } from '@angular/core';
import { signal, inject } from '@angular/core';
import { PokeappService } from '../services/pokeapp.service/pokeapp-service';
import { Pokemon } from '../models/pokemon.model';

@Component({
  selector: 'app-pokemons',
  imports: [],
  templateUrl: './pokemons.html',
  styleUrl: './pokemons.css',
})
export class Pokemons {

PokeappService = inject(PokeappService);

  pokemons = signal<Pokemon[]>([]);

  constructor() {
    this.PokeappService.loadAllPokemons();
    this.pokemons.set(this.PokeappService.pokemons());
  }

}
