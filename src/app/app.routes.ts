import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { MainComponent } from './main/main';
import { App as AppComponent } from './app';
import { CartComponent } from './cart/cart';
import { UserProfile } from './user-profile/user-profile';
import { Register } from './register/register';
import { SearchedItems } from './searched-items/searched-items';
import { ShipmentTracking } from './shipment-tracking/shipment-tracking';
import { ProductPage } from './product-page/product-page';
import { NewProductPage } from './new-product-page/new-product-page';

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
        path: 'search',
        component: SearchedItems,
        canActivate: [AuthGuard]
    },
    {
        path: 'shipments',
        component: ShipmentTracking,
        canActivate: [AuthGuard]
    },
    {
        path: 'product/:id',
        component: ProductPage,
        canActivate: [AuthGuard]
    },
    {
        path: 'new-product',
        component: NewProductPage,
        canActivate: [AuthGuard]
    },
    { path: '**', redirectTo: '' }
];
