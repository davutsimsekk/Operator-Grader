import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, RouterLink, MatIconModule, MatCheckboxModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(private authService: AuthService, private router: Router) { }

  register() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.authService.register(this.username, this.password)) {
      // Kayıt başarılı olduğunda hem kayıt yapıyoruz hem de kullanıcıyı otomatik giriş yapıyoruz
      this.authService.login(this.username, this.password);
      this.successMessage = 'Kayıt başarılı! Dashboard sayfasına yönlendiriliyorsunuz...';
      this.errorMessage = '';
      
      // Kısa bir süre bekleyerek başarı mesajını görmesini sağlıyoruz
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
    } else {
      this.errorMessage = 'Bu kullanıcı adı zaten kullanılıyor.';
      this.successMessage = '';
    }
  }
}
