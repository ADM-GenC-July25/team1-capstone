import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { MainComponent } from './main/main';
import { App as AppComponent } from './app';
import { CartComponent } from './cart/cart';
import { UserProfile } from './user-profile/user-profile';
import { Register } from './register/register';
import { ShipmentTracking } from './shipment-tracking/shipment-tracking';
import { CallbackComponent } from './auth/callback.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [LoginGuard]
    },
    {
        path: 'callback',
        component: CallbackComponent
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
    {
        path: 'userInfo',
        component: UserProfile,
        canActivate: [AuthGuard]
    },
    {
        path: 'register',
        component: Register,
        canActivate: [LoginGuard]
    },
    {
        path: 'shipments',
        component: ShipmentTracking,
        canActivate: [AuthGuard]
    },
    { path: '**', redirectTo: '' }
];
