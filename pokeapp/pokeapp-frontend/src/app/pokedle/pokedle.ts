import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

type Compare = 'ok' | 'partial' | 'no';

type Poke = {
  id: number;
  name: string;
  types: string[];
  stats: { hp: number; atk: number; def: number; spatk: number; spdef: number; speed: number };
  sprite: string;
};

type StatResult = { cmp: Compare; arrow: '↑' | '↓' | '' };

type GuessRow = {
  guess: Poke;
  nameOk: boolean;
  types: Compare;

  hp: StatResult;
  atk: StatResult;
  def: StatResult;
  spatk: StatResult;
  spdef: StatResult;
  speed: StatResult;

  isNew?: boolean;
};

@Component({
  selector: 'app-pokedle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokedle.html',
  styleUrl: './pokedle.css',
})
export class Pokedle implements OnInit {
  loading = true;
  error = '';

  all: Poke[] = [];
  secret!: Poke;

  input = '';
  suggestions: Poke[] = [];

  rows: GuessRow[] = [];
  won = false;


  hintAfter = 5;


  hintGiven = false;
  hint = '';

  private apiUrl = 'http://localhost:3000/pokemons/pokedle';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadPokemonsAndStart();
  }

  newGame() {

    this.won = false;
    this.rows = [];
    this.input = '';
    this.suggestions = [];
    this.error = '';

    this.hintGiven = false;
    this.hint = '';

    if (this.all.length > 0) {
      this.secret = this.pickRandomSecret(this.all);
      this.saveProgress();
      this.cdr.detectChanges();
    } else {
      this.loadPokemonsAndStart(true);
    }
  }

  onInputChange() {
    if (this.won || !this.secret) return;

    const q = this.input.trim().toLowerCase();
    if (!q) {
      this.suggestions = [];
      this.cdr.detectChanges();
      return;
    }

    const usedIds = new Set<number>(this.rows.map(r => r.guess.id));

    this.suggestions = this.all
      .filter(p => !usedIds.has(p.id))
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 8);

    this.cdr.detectChanges();
  }

  pickSuggestion(p: Poke) {
    this.input = p.name;
    this.suggestions = [];
    this.cdr.detectChanges();
  }

  submitGuess() {
    if (this.won || !this.secret) return;

    const q = this.input.trim().toLowerCase();
    if (!q) return;

    const guess = this.all.find(p => p.name.toLowerCase() === q);
    if (!guess) {
      this.error = 'Ese Pokémon no existe';
      this.cdr.detectChanges();
      return;
    }

    if (this.rows.some(r => r.guess.id === guess.id)) {
      this.error = 'Ya has probado ese Pokémon';
      this.cdr.detectChanges();
      return;
    }

    this.error = '';
    this.input = '';
    this.suggestions = [];

    const row: GuessRow = {
      guess,
      nameOk: guess.id === this.secret.id,
      types: this.compareTypes(guess.types, this.secret.types),

      hp: this.compareNumber(guess.stats.hp, this.secret.stats.hp),
      atk: this.compareNumber(guess.stats.atk, this.secret.stats.atk),
      def: this.compareNumber(guess.stats.def, this.secret.stats.def),
      spatk: this.compareNumber(guess.stats.spatk, this.secret.stats.spatk),
      spdef: this.compareNumber(guess.stats.spdef, this.secret.stats.spdef),
      speed: this.compareNumber(guess.stats.speed, this.secret.stats.speed),

      isNew: true,
    };

    this.rows = [row, ...this.rows];

    setTimeout(() => {
      row.isNew = false;
      this.cdr.detectChanges();
    }, 450);

    if (row.nameOk) this.won = true;

    if (!this.hintGiven && this.rows.length >= this.hintAfter && !this.won) {
      this.hintGiven = true;
      const firstLetter = this.secret.name.charAt(0).toUpperCase();
      const primaryType = (this.secret.types?.[0] || '').toString();
      this.hint = `Pista: empieza por "${firstLetter}" y su tipo principal es "${primaryType}".`;
    }

    this.saveProgress();
    this.cdr.detectChanges();
  }

  private loadPokemonsAndStart(forceNewGame = false) {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.http.get<any[]>(this.apiUrl)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (list: any[]) => {
          try {
            this.all = (list || [])
              .map((raw: any) => this.mapFromBackend(raw))
              .filter((p: Poke | null): p is Poke => p !== null);

            if (this.all.length === 0) {
              this.error = 'No hay Pokémon válidos (revisa /pokemons/pokedle)';
              this.cdr.detectChanges();
              return;
            }


            const restored = !forceNewGame && this.restoreProgress();
            if (!restored) {
              this.secret = this.pickRandomSecret(this.all);
              this.rows = [];
              this.won = false;
              this.hintGiven = false;
              this.hint = '';
              this.saveProgress();
            }

            this.cdr.detectChanges();
          } catch (e) {
            console.error('POKEDLE parse error:', e);
            this.error = 'Error procesando JSON (mira Console)';
            this.cdr.detectChanges();
          }
        },
        error: (e: any) => {
          console.error('POKEDLE HTTP error:', e);
          this.error = e?.error?.error || 'No se pudieron cargar los Pokémon del backend';
          this.cdr.detectChanges();
        }
      });
  }


  private mapFromBackend(raw: any): Poke | null {
    const id = Number(raw?.id);
    const name = typeof raw?.name?.english === 'string' ? raw.name.english : null;
    if (!id || !name) return null;

    const types: string[] = Array.isArray(raw?.type) ? raw.type : [];
    const base = raw?.base ?? {};

    const hp = Number(base?.HP ?? 0);
    const atk = Number(base?.Attack ?? 0);
    const def = Number(base?.Defense ?? 0);
    const spatk = Number(base?.['Sp. Attack'] ?? 0);
    const spdef = Number(base?.['Sp. Defense'] ?? 0);
    const speed = Number(base?.Speed ?? 0);

    const sprite =
      raw?.image?.sprite ||
      raw?.image?.thumbnail ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

    return { id, name, types, stats: { hp, atk, def, spatk, spdef, speed }, sprite };
  }

  private compareTypes(a: string[], b: string[]): Compare {
    const A = (a || []).map(x => x.toLowerCase());
    const B = (b || []).map(x => x.toLowerCase());

    const exact = [...A].sort().join(',') === [...B].sort().join(',');
    if (exact) return 'ok';
    return A.some(t => B.includes(t)) ? 'partial' : 'no';
  }

  private compareNumber(g: number, s: number): StatResult {
    if (g === s) return { cmp: 'ok', arrow: '' };
    return g < s ? { cmp: 'no', arrow: '↑' } : { cmp: 'no', arrow: '↓' };
  }

  private pickRandomSecret(list: Poke[]): Poke {
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }


  private storageKey() {
    return 'pokedle-current-game';
  }

  private saveProgress() {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify({
        secretId: this.secret?.id,
        rows: this.rows.map(r => ({ ...r, isNew: false })),
        won: this.won,
        hintGiven: this.hintGiven,
        hint: this.hint
      }));
    } catch {}
  }

  private restoreProgress(): boolean {
    const raw = localStorage.getItem(this.storageKey());
    if (!raw) return false;

    try {
      const parsed = JSON.parse(raw);
      const secretId = Number(parsed?.secretId);

      const found = this.all.find(p => p.id === secretId);
      if (!found) return false;

      this.secret = found;
      this.rows = (parsed?.rows || []).map((r: GuessRow) => ({ ...r, isNew: false }));
      this.won = !!parsed?.won;

      this.hintGiven = !!parsed?.hintGiven;
      this.hint = typeof parsed?.hint === 'string' ? parsed.hint : '';

      return true;
    } catch {
      return false;
    }
  }
}
