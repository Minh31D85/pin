import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IpAdressPageRoutingModule } from './socket-routing.module';

import { IpAdressPage } from './socket';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IpAdressPageRoutingModule
  ],
  declarations: [IpAdressPage]
})
export class IpAdressPageModule {}
