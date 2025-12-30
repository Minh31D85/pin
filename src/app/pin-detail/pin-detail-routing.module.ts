import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PinDetailPage } from './pin-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PinDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PinDetailPageRoutingModule {}
