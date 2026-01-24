import { Pokemon } from './pokemon.model';

export interface Team {
  _id: string;
  name: string;
  description: string;
  pokemons: number[] | Pokemon[];
  creator: any;
  creatorName: string;
  tags?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  likes?: string[];
  dislikes?: string[];
  hasLiked?: boolean;
  hasDisliked?: boolean;
  comments?: any[];
}

export interface TeamsResponse {
  success: boolean;
  count: number;
  data: Team[];
}
