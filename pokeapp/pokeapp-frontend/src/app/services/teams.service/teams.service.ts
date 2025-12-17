import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PokemonInTeam {
  pokemonId: number;
  name: string;
  sprite: string;
}

export interface Team {
  _id: string;
  name: string;
  description: string;
  pokemons: PokemonInTeam[];
  tags: string[];
  isPublic: boolean;
  creator: any;
  creatorName: string;
  views: number;
  likes: string[];
  comments: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamsResponse {
  success: boolean;
  data: Team[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TeamResponse {
  success: boolean;
  data: Team;
}

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private apiUrl = 'http://localhost:3000/teams';

  constructor(private http: HttpClient) {}

  // --- Helpers ---
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  // --- Public ---
  getAllTeams(
    page: number = 1,
    limit: number = 20,
    sort: string = 'createdAt',
    order: string = 'desc',
    search: string = '',
    tag: string = ''
  ): Observable<TeamsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sort', sort)
      .set('order', order);

    if (search) params = params.set('search', search);
    if (tag) params = params.set('tag', tag);

    return this.http.get<TeamsResponse>(this.apiUrl, { params });
  }

  getTeamById(id: string): Observable<TeamResponse> {
    return this.http.get<TeamResponse>(`${this.apiUrl}/${id}`);
  }

  // --- Protected ---
  getUserTeams(): Observable<{ success: boolean; data: Team[] }> {
    return this.http.get<{ success: boolean; data: Team[] }>(`${this.apiUrl}/user/teams`, {
      headers: this.getAuthHeaders()
    });
  }

  createTeam(teamData: any): Observable<any> {
    return this.http.post(this.apiUrl, teamData, {
      headers: this.getAuthHeaders()
    });
  }

  updateTeam(id: string, teamData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, teamData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteTeam(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  addComment(id: string, text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/comment`, { text }, {
      headers: this.getAuthHeaders()
    });
  }

  likeTeam(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/like`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  getPopularTags(): string[] {
    return [
      'Competitivo', 'Campaign', 'Shiny', 'Legendario',
      'Starter', 'Eeveelution', 'Monotype', 'Balanceado',
      'Ofensivo', 'Defensivo', 'Rápido', 'Trick Room'
    ];
  }
}
