import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokeappService } from '../services/pokeapp.service/pokeapp-service';
import { Pokemon } from '../models/pokemon.model';
import { CommonModule } from '@angular/common';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-pokemon-details',
    imports: [CommonModule, TitleCasePipe],
  templateUrl: './pokemon-details.html',
  styleUrl: './pokemon-details.css'
})
export class PokemonDetails {
  private route = inject(ActivatedRoute);
  private pokeappService = inject(PokeappService);

  pokemon = signal<Pokemon | null>(null);
  loading = signal(true);

  constructor() {
    const id = Number(this.route.snapshot.params['id']);

    this.pokeappService.getPokemonById$(id).subscribe({
      next: (p: Pokemon) => {
        this.pokemon.set(p);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading.set(false);
      }
    });
  }

  // Convertir objeto base a array para *ngFor
  getBaseStatsArray(baseStats: any): Array<{name: string, value: number}> {
    return Object.entries(baseStats).map(([key, value]) => ({
      name: key,
      value: value as number
    }));
  }

  // Calcular porcentaje para barras de stats (max 255 como en Pokémon)
  getStatPercentage(value: number): number {
    const maxStat = 255; // Máximo posible en Pokémon
    return (value / maxStat) * 100;
  }

  // Sumar todas las stats para total
  getTotalStats(baseStats: any): number {
    return Object.values(baseStats).reduce((sum: number, val: any) => sum + val, 0);
  }

  // Verificar si es tipo especial (para colores)
  isSpecialStat(statName: string): boolean {
    return statName.includes('Sp.');
  }
}
