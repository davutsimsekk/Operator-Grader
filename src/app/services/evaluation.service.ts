import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EvaluationData {
  cagriId: string;
  degerlendirmeDurumu: string;
  asistanSicil: string;
  asistanAdiSoyadi: string;
  cagriTarihi: Date;
  cagriSuresi: string;
  degerlendireninAdi: string;
  degerlendirmeNo: string;
  degerlendirmePuani: number;
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = 'http://localhost:5000'; // Flask backend URL

  constructor(private http: HttpClient) { }

  getEvaluations(): Observable<EvaluationData[]> {
    return this.http.get<EvaluationData[]>(`${this.apiUrl}/evaluations`);
  }

  getEvaluationById(id: string): Observable<EvaluationData> {
    return this.http.get<EvaluationData>(`${this.apiUrl}/evaluations/${id}`);
  }
} 