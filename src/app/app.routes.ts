import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { MainComponent } from './main/main';
import { App as AppComponent } from './app';
import { UserProfile } from './user-profile/user-profile';

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
        path: 'userInfo',
        component: UserProfile,
        canActivate: [AuthGuard]
    },
    { path: '**', redirectTo: '' }
];
