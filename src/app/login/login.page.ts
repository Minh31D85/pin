import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { NavController, Platform } from '@ionic/angular';
import { Service } from '../service';

/**
 * This component serves as the login page for the application. It checks for stored credentials and navigates users accordingly. 
 * If no PIN is found, it redirects to the registration page. If server IP or port is missing, it redirects to the IP address configuration page.
 * The component also handles biometric authentication for a seamless login experience.
 * 
 * Note: The component relies on Capacitor's Preferences API for storing and retrieving user credentials and Ionic's navigation for routing between pages.
 */

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})

export class LoginPage implements OnInit {
  showPin: boolean = false;
  pin: string = '';

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private service: Service,
  ) { }


  /**
   * @description OnInit lifecycle hook to check for stored credentials and navigate accordingly. It also initiates biometric authentication if credentials are present.
   */
  async ngOnInit() {
    const storedPin = await Preferences.get({ key: 'pin' });
    const storedIp = await Preferences.get({ key: 'server_ip' });
    const storedPort = await Preferences.get({ key: 'server_port' });  

    if(!storedPin.value){this.navCtrl.navigateRoot('/register'); return}
    if(!storedIp.value || !storedPort.value){this.navCtrl.navigateRoot('/ip-adress'); return}

    await this.platform.ready().then(() => {this.performBiometric();})
  }


  /**
   * @description Handle the login process by comparing the entered PIN with the stored PIN. If they match, navigate to the home page; otherwise, show an alert.
   */
  async login() {
    const storedPin = await Preferences.get({ key: 'pin' });
    if(this.pin === storedPin.value){
      this.navCtrl.navigateRoot('/home');
    }else{
      alert('Invalid PIN!');
    }
  }


  /**
   * @description Perform biometric authentication and navigate to the home page if successful.
   */
  async performBiometric(){
    const ok = await this.service.loginBiometric();
    if(!ok) return;
    this.navCtrl.navigateRoot('/home');
  }
}
