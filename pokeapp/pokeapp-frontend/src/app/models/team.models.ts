import { Pokemon } from './pokemon.model';

export interface Team {
  _id: string;
  name: string;
  description: string;
  pokemons: number[] | Pokemon[];  // IDs o objetos completos
  creator: any;
  creatorName: string;
  isPublic: boolean;
  tags?: string[];  // Hacer opcional
  createdAt: string | Date;  // Permitir string
  updatedAt: string | Date;  // Permitir string
}

export interface TeamsResponse {
  success: boolean;
  count: number;
  data: Team[];
}
