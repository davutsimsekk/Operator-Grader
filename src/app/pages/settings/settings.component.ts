import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from '../../auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  // Tab selection
  selectedTabIndex: number = 0;
  
  // General Settings
  language: string = 'tr';
  darkMode: boolean = false;
  emailNotifications: boolean = true;
  
  // System Settings
  apiEndpoint: string = 'http://localhost:5000';
  refreshInterval: number = 5;
  
  // User Profile Settings
  currentUsername: string = '';
  newUsername: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  fullName: string = '';
  email: string = '';
  phone: string = '';
  department: string = '';
  position: string = '';
  bio: string = '';
  profilePictureUrl: string = 'assets/default-profile.jpg';
  
  // Error messages
  usernameError: string = '';
  passwordError: string = '';
  
  constructor(
    private authService: AuthService, 
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { 
    this.currentUsername = this.authService.getCurrentUsername();
    this.newUsername = this.currentUsername;
    
    // In a real app, these would be fetched from a backend
    this.fullName = 'Demo Kullanıcı';
    this.email = 'demo@example.com';
    this.phone = '+90 555 123 4567';
    this.department = 'Çağrı Merkezi';
    this.position = 'Supervisor';
  }
  
  ngOnInit() {
    // Check for tab query parameter
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'profile') {
        this.selectedTabIndex = 0;
      }
    });
  }
  
  saveGeneralSettings() {
    console.log('Saving general settings...');
    this.showSuccessMessage('Genel ayarlar başarıyla kaydedildi');
  }
  
  saveSystemSettings() {
    console.log('Saving system settings...');
    this.showSuccessMessage('Sistem ayarları başarıyla kaydedildi');
  }
  
  updateUsername() {
    this.usernameError = '';
    
    if (!this.newUsername.trim()) {
      this.usernameError = 'Kullanıcı adı boş olamaz';
      return;
    }
    
    if (this.newUsername === this.currentUsername) {
      this.usernameError = 'Yeni kullanıcı adı mevcut kullanıcı adı ile aynı olamaz';
      return;
    }
    
    // In a real app, we would update the username on the server first
    const storedPassword = JSON.parse(localStorage.getItem(this.currentUsername) || '{}').password;
    
    if (!storedPassword) {
      this.usernameError = 'Kullanıcı bilgileri bulunamadı';
      return;
    }
    
    // Check if new username already exists
    if (localStorage.getItem(this.newUsername)) {
      this.usernameError = 'Bu kullanıcı adı zaten kullanımda';
      return;
    }
    
    // Save the credentials under the new username
    localStorage.setItem(this.newUsername, JSON.stringify({ password: storedPassword }));
    
    // Remove the old entry
    localStorage.removeItem(this.currentUsername);
    
    // Update current user in localStorage
    localStorage.setItem('currentUser', this.newUsername);
    
    // Update the current username in the component
    this.currentUsername = this.newUsername;
    
    this.showSuccessMessage('Kullanıcı adı başarıyla güncellendi');
  }
  
  updatePassword() {
    this.passwordError = '';
    
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Tüm şifre alanları doldurulmalıdır';
      return;
    }
    
    // Verify current password
    const storedData = JSON.parse(localStorage.getItem(this.currentUsername) || '{}');
    if (storedData.password !== this.currentPassword) {
      this.passwordError = 'Mevcut şifre yanlış';
      return;
    }
    
    // Verify new password and confirmation match
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Yeni şifre ve onay şifresi eşleşmiyor';
      return;
    }
    
    // Update password
    localStorage.setItem(this.currentUsername, JSON.stringify({ password: this.newPassword }));
    
    // Reset the form fields
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    
    this.showSuccessMessage('Şifre başarıyla güncellendi');
  }
  
  updateProfile() {
    // In a real app, this would update the user's profile on the server
    this.showSuccessMessage('Profil bilgileri başarıyla güncellendi');
  }
  
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // In a real app, we would upload this file to a server
      // For demo purposes, we'll use FileReader to display the image
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePictureUrl = reader.result as string;
      };
      
      reader.readAsDataURL(file);
      this.showSuccessMessage('Profil fotoğrafı güncellendi');
    }
  }
  
  showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Kapat', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
