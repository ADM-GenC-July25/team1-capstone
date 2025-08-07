import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { MainComponent } from './main/main';
import { App as AppComponent } from './app';
import { CartComponent } from './cart/cart';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [LoginGuard]
    },
    {
        path: '',
        component: MainComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'cart',
        component: CartComponent,
        canActivate: [AuthGuard]
    },
    { path: '**', redirectTo: '' }
];
