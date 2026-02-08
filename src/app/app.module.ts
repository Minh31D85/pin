import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApiService } from './api-service';


/**
 * The main application module that bootstraps the Ionic Angular app. 
 * It imports necessary modules, declares the root component, and sets up providers for HTTP client and route reuse strategy.
 * The APP_INITIALIZER provider is used to ensure that the ApiService's initialization logic is executed before the app starts, 
 * allowing for any necessary setup (like fetching configuration or initializing services) to be completed.
 * This module serves as the entry point for the application, defining the core structure and dependencies required for the app to function properly.
 * @module AppModule
 * @see {@link AppComponent} for the root component of the application.
 * @see {@link AppRoutingModule} for the routing configuration of the application.
 * @see {@link ApiService} for the service responsible for API interactions and initialization logic. 
 */

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
