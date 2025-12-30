import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PinItem, Service } from '../service';



@Component({
  selector: 'app-pin-detail',
  templateUrl: './pin-detail.page.html',
  styleUrls: ['./pin-detail.page.scss'],
  standalone: false,
})
export class PinDetailPage implements OnInit {
  nameFromRoute = '';
  entry?: PinItem;


  constructor(
    private route: ActivatedRoute,
    public service: Service
  ) { }

  async ngOnInit() {
    await this.service.load();
    this.nameFromRoute = this.route.snapshot.paramMap.get('name') ?? '';
    const normalized = this.nameFromRoute.trim().toLowerCase();

    this.entry = this.service.itemList.find(
      item => item.name.trim().toLocaleLowerCase() === normalized);
  }
}
