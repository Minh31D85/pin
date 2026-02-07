import { Component } from '@angular/core';
import { App } from '@capacitor/app';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})

export class AppComponent {
  private wasInBackground = false;

  constructor(private navCtrl: NavController) { this.setupLock() }

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
