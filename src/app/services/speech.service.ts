import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Speech {
  ID: number;
  KonusmaSuresi: string;
  Musteri: string;
  Operator: string;
  Puan: number;
}

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private apiUrl = 'http://localhost:5000'; // Flask backend URL

  constructor(private http: HttpClient) { }

  getDailySorted(): Observable<Speech[]> {
    return this.http.get<Speech[]>(`${this.apiUrl}/dailySorted`);
  }

  getWeeklySorted(): Observable<Speech[]> {
    return this.http.get<Speech[]>(`${this.apiUrl}/weeklySorted`);
  }

  getMonthlySorted(): Observable<Speech[]> {
    return this.http.get<Speech[]>(`${this.apiUrl}/monthlySorted`);
  }
} 