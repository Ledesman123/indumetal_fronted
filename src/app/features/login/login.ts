import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { ForgotPasswordDialog } from './forgot-password-dialog/forgot-password-dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  cargando = signal(false);
  error = signal<string | null>(null);
  ocultarPassword = signal(true);

  form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  ingresar(): void {
    if (this.form.invalid) return;

    this.error.set(null);
    this.cargando.set(true);

    this.authService.login({
      correo: this.form.value.correo!,
      password: this.form.value.password!
    }).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('Correo o contraseña incorrectos.');
      }
    });
  }

  abrirRecuperarPassword(): void {
    this.dialog.open(ForgotPasswordDialog, {
      width: '420px',
      disableClose: true
    });
  }
}