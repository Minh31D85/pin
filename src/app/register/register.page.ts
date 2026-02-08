import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

/**
 * This page allows the user to set a 4-digit PIN code for authentication. The PIN is stored securely using Capacitor's Preferences API.
 * The user must enter a valid 4-digit numeric PIN, which is then saved and the user is navigated to the IP address configuration page.
 * The page includes basic validation to ensure the PIN is exactly 4 digits and numeric before saving.
 * 
 * Note: In a production application, consider using a more secure storage solution for sensitive data like PINs, such as Capacitor's Secure Storage plugin.
 * The UI should include an input field for the PIN and a button to trigger the registration process. The input should be of type "password" to hide the entered digits.
 */

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
