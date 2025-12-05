import { Component, signal, inject } from '@angular/core';
import { PokeappService } from '../pokeapp-service';
import { Router } from '@angular/router';
import { Pokemon } from '../models/pokemon.model';
import { CommonModule, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-pokedex',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './pokedex.html',
  styleUrl: './pokedex.css',
})
export class Pokedex {

  private pokeappService = inject(PokeappService);
  private router = inject(Router);

  pokemons = signal<Pokemon[]>([]);
  loading = signal(true);


  constructor() {
    this.pokeappService.getPokemons().subscribe(data => {
    this.pokemons.set(data);
    this.loading.set(false);
  });
  }

  goToDetail(index: number) {
    this.router.navigate(['/pokemon', index + 1]);
  }
}
