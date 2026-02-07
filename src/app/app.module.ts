import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApiService } from './api-service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: APP_INITIALIZER,
      useFactory: (api: ApiService) => () => api.init(),
      deps: [ApiService],
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
