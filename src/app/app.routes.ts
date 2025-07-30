import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { AuthGuard } from './guards/auth.guard';
import { MainComponent } from './components/main.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: MainComponent,
        canActivate: [AuthGuard]
    },
    { path: '**', redirectTo: '' }
];
