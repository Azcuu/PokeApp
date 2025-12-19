export interface PokemonName {
  english: string;
  japanese: string;
  chinese: string;
  french: string;
}

export interface PokemonBaseStats {
  HP: number;
  Attack: number;
  Defense: number;
  'Sp. Attack': number;
  'Sp. Defense': number;
  Speed: number;
}

export interface PokemonEvolution {
  next: string[][];
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface PokemonProfile {
  height: string;
  weight: string;
  egg: string[];
  ability: string[][];
  gender: string;
}

export interface PokemonImages {
  sprite: string;
  thumbnail: string;
  hires: string;
}

export interface Pokemon {
  _id?: string;
  id: number;
  name: PokemonName;
  type: string[];
  base: PokemonBaseStats;
  species?: string;
  description?: string;
  evolution?: PokemonEvolution;
  profile?: PokemonProfile;
  image: PokemonImages;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface PokemonsResponse {
  success: boolean;
  count: number;
  data: Pokemon[];
}

