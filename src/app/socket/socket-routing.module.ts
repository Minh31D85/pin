import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IpAdressPage } from './socket';

const routes: Routes = [
  {
    path: '',
    component: IpAdressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IpAdressPageRoutingModule {}
