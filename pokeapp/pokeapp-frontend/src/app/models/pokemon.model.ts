export interface Pokemon {
  id: string;
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  sprites: { front_default: string };
}

export interface PokemonsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
}
