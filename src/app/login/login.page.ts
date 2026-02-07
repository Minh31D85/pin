import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { NavController, Platform } from '@ionic/angular';
import { Service } from '../service';

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

  async ngOnInit() {
    const storedPin = await Preferences.get({ key: 'pin' });
    const storedIp = await Preferences.get({ key: 'server_ip' });
    const storedPort = await Preferences.get({ key: 'server_port' });  

    if(!storedPin.value){this.navCtrl.navigateRoot('/register'); return}
    if(!storedIp.value || !storedPort.value){this.navCtrl.navigateRoot('/ip-adress'); return}

    await this.platform.ready().then(() => {this.performBiometric();})
  }

  async login() {
    const storedPin = await Preferences.get({ key: 'pin' });
    if(this.pin === storedPin.value){
      this.navCtrl.navigateRoot('/home');
    }else{
      alert('Invalid PIN!');
    }
  }

  async performBiometric(){
    const ok = await this.service.loginBiometric();
    if(!ok) return;
    this.navCtrl.navigateRoot('/home');
  }
}
