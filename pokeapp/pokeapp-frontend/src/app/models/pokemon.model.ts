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
  next: string[][];  // Ej: [["2", "Level 16"]]
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface PokemonProfile {
  height: string;      // "0.7 m"
  weight: string;      // "6.9 kg"
  egg: string[];       // ["Monster", "Grass"]
  ability: string[][]; // [["Overgrow", "false"], ["Chlorophyll", "true"]]
  gender: string;      // "87.5:12.5"
}

export interface PokemonImages {
  sprite: string;
  thumbnail: string;
  hires: string;
}

// Interfaz principal
export interface Pokemon {
  _id?: string;        // MongoDB ObjectId (opcional, lo añade MongoDB)
  id: number;          // ID numérico del Pokémon (1, 2, 3...)
  name: PokemonName;
  type: string[];      // ["Grass", "Poison"]
  base: PokemonBaseStats;
  species?: string;    // "Seed Pokémon"
  description?: string;
  evolution?: PokemonEvolution;
  profile?: PokemonProfile;
  image: PokemonImages;
  createdAt?: Date;    // Si usas timestamps
  updatedAt?: Date;    // Si usas timestamps
}

// Para la respuesta de tu API
export interface PokemonsResponse {
  success: boolean;    // Según tu estructura de respuesta
  count: number;
  data: Pokemon[];
}

// Interfaz para equipos
export interface Team {
  _id?: string;
  name: string;
  pokemons: number[] | Pokemon[];  // IDs o objetos completos
  description?: string;
  createdBy: string;
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TeamsResponse {
  success: boolean;
  count: number;
  data: Team[];
}
