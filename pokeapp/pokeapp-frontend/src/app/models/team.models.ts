import { Pokemon } from './pokemon.model';

export interface Team {
  _id: string;
  name: string;
  description: string;
  pokemons: number[] | Pokemon[];
  creator: any;
  creatorName: string;
  isPublic: boolean;
  tags?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface TeamsResponse {
  success: boolean;
  count: number;
  data: Team[];
}
