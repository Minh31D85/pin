import { Component } from '@angular/core';
import { App } from '@capacitor/app';
import { NavController } from '@ionic/angular';

/**
 * The root component of the Ionic Angular application. 
 * It listens for app state changes to determine when the app goes into the background and when it becomes active again.
 * When the app goes into the background, it sets a flag to indicate that the app was in the background. 
 * When the app becomes active again, it checks if it was previously in the background and if so, it navigates the user to the login page.
 * This ensures that users are prompted to log in again when they return to the app after it has been in the background, enhancing security and user experience.
 * @component AppComponent
 * @see {@link NavController} for navigation control within the app.
 * @see {@link App} for listening to app state changes using Capacitor's App plugin.
 * @method setupLock - Sets up the listener for app state changes to manage navigation based on the app's active state.
 */

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})

export class AppComponent {
  private wasInBackground = false;

  /**
   * @description Initializes the AppComponent and sets up the app state change listener to manage navigation based on the app's active state.
   * @param navCtrl 
   */
  constructor(private navCtrl: NavController) { this.setupLock() }

  /**
   * @description Sets up a listener for app state changes using Capacitor's App plugin.
   * @returns void
   */
  setupLock(){
    App.addListener('appStateChange', ({ isActive })=>{
      if(!isActive){
        this.wasInBackground=true; 
        return
      }
      if(isActive && this.wasInBackground){
        this.wasInBackground = false;
        this.navCtrl.navigateRoot('/login');
      }
    });
  }
}
