import { Component } from '@angular/core';
import { NavController, ViewWillLeave } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    HeaderComponent,
    RouterModule
  ]
})
export class LoginPageComponent implements ViewWillLeave {

  isLogin: boolean = true;
  headerTitle: string = 'Iniciar sesión';
  loginForm!: FormGroup;

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private navController: NavController,
    private router: Router
  ) { 
    addIcons({
      arrowBackOutline
    });

    this.isLogin = this.router.url.includes('/login');

    const controls: any = {
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    };
  
    if (!this.isLogin) {
      this.headerTitle = 'Registrarse'
      controls.confirmPassword = new FormControl('', [Validators.required]);
    }
  
    // Si register, comprobar que password y confirmPassword sean iguales
    const matchPasswordsValidator = (form: AbstractControl) => {
      return form.get('password')?.value === form.get('confirmPassword')?.value
        ? null
        : { passwordMismatch: true };
    };
    
    this.loginForm = new FormGroup(controls, {
      validators: !this.isLogin ? matchPasswordsValidator : null
    });

    console.log(this.isLogin)
  }

  ionViewWillLeave(): void {
    this.loginForm.reset();
  }

  goBack() {
    this.navController.navigateBack('/home');
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async submit() {
    if (this.loginForm.invalid) {
      this.showErrorMessage('Por favor, completa los campos correctamente.');
      return;
    }
  
    const loading = await this.loadingController.create({
      message: this.isLogin ? 'Iniciando sesión...' : 'Creando cuenta...',
      spinner: 'crescent',
      duration: 2000
    });
  
    await loading.present();
  
    const { email, password } = this.loginForm.value;
  
    try {
      if (!this.isLogin) {
        await this.authService.register(email!, password!);
        this.showInfoMessage('Registro exitoso. Redirigiendo al login...');
        setTimeout(() => {
          this.navController.navigateBack('/home/login');
        }, 1250);
      } else {
        await this.authService.login(email!, password!);
        this.showInfoMessage('Inicio de sesión realizado. Redirigiendo...');
        setTimeout(() => {
          this.router.navigateByUrl("/locations", { replaceUrl: true });
        }, 1250);
      }
    } catch (error) {
      this.showErrorMessage('Error: ' + (error as any).message);
    } finally {
      loading.dismiss();
    }
  }
  
  async showErrorMessage(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    toast.present();
  }

  async showInfoMessage(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }
}