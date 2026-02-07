import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})

export class RegisterPage implements OnInit {
  showPin: boolean = false;
  pin: string = '';

  constructor(private navCtrl: NavController) { }

  ngOnInit() { }

  async registerPin(){
    if (this.pin.length !== 4){alert('PIN must 4 digits long'); return;}
    if (!/^\d{4}$/.test(this.pin)){alert('PIN must be numeric'); return;}

    await Preferences.set({
      key: 'pin',
      value: this.pin,
    });
    alert('PIN saved!');
    this.navCtrl.navigateRoot('/ip-adress')
  }
}
