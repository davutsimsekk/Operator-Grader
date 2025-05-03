import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../auth.service';

interface Bildirim {
  id: number;
  tip: 'bilgi' | 'uyari' | 'hata' | 'basari';
  baslik: string;
  mesaj: string;
  tarih: Date;
  okundu: boolean;
}

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  // Bildirimler için özellikler
  bildirimler: Bildirim[] = [];
  bildirimSayisi: number = 0;
  
  constructor(public authService: AuthService) {}
  
  ngOnInit() {
    // Demo veriler
    this.loadDemoData();
  }
  
  // Bildirim tipine göre icon döndüren yardımcı metod
  getBildirimIcon(tip: string): string {
    switch(tip) {
      case 'bilgi': return 'info';
      case 'uyari': return 'warning';
      case 'hata': return 'error';
      case 'basari': return 'check_circle';
      default: return 'notifications';
    }
  }
  
  // Bildirimleri okundu olarak işaretle
  tumBildirimleriOkunduIsaretle() {
    this.bildirimler.forEach(bildirim => bildirim.okundu = true);
    this.bildirimSayisi = 0;
  }
  
  // Logout metodu
  logout() {
    this.authService.logout();
  }
  
  // Demo veri yükleme (gerçek uygulamada bu veriler bir API'den gelecektir)
  private loadDemoData() {
    // Demo bildirimler
    this.bildirimler = [
      {
        id: 1,
        tip: 'bilgi',
        baslik: 'Sistem Güncellemesi',
        mesaj: 'Sistemde yeni özellikler kullanıma sunuldu.',
        tarih: new Date(),
        okundu: false
      },
      {
        id: 2,
        tip: 'uyari',
        baslik: 'Performans Değerlendirmesi',
        mesaj: 'Aylık performans değerlendirmeniz için son 2 gün.',
        tarih: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 saat önce
        okundu: false
      },
      {
        id: 3,
        tip: 'basari',
        baslik: 'Tebrikler!',
        mesaj: 'Bu ayki hedeflerinizi başarıyla tamamladınız.',
        tarih: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 gün önce
        okundu: true
      }
    ];
    
    // Okunmamış bildirim sayısını hesapla
    this.bildirimSayisi = this.bildirimler.filter(b => !b.okundu).length;
  }
}
