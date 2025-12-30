import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PinDetailPageRoutingModule } from './pin-detail-routing.module';

import { PinDetailPage } from './pin-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PinDetailPageRoutingModule
  ],
  declarations: [PinDetailPage]
})
export class PinDetailPageModule {}
