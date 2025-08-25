import { NgModule } from '@angular/core';
import { AuthModule } from 'angular-auth-oidc-client';

@NgModule({
  imports: [
    AuthModule.forRoot({
      config: {
        authority: 'https://us-west-2thmn4kcfg.auth.us-west-2.amazoncognito.com',
        redirectUrl: 'http://localhost:4200',
        clientId: '7jmckarda122knqeggvk3falcc',
        scope: 'openid email phone',
        responseType: 'code'
      },
    }),
    // ...other imports...
  ],
  exports: [AuthModule],
})
export class AppModule { }