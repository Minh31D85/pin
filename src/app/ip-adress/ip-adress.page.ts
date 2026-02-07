import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from '../api-service';

@Component({
  selector: 'app-ip-adress',
  templateUrl: './ip-adress.page.html',
  styleUrls: ['./ip-adress.page.scss'],
  standalone: false
})

export class IpAdressPage implements OnInit {
  ip:string = '';
  port: string = '';
  loading: boolean = false;

  constructor(
    private api: ApiService,
    private navCtrl: NavController
  ){}

  ngOnInit(): void {
    const conn = this.api.getConnection();
    this.ip = conn.ip || '';
    this.port = conn.port || '';
  }

  async saveIp(){
    if(this.loading) return;
    this.loading = true;

    try{
      await this.api.setConnection(this.ip, this.port);
      await this.timeoutHealthCheck();
      this.navCtrl.navigateRoot('/login')    
    }catch(e: any){
      alert(e.message || 'Server nicht erreichbar');
    }
    this.loading = false;
  }

  private async timeoutHealthCheck(){
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Server Timeout')), 3000)
    );
    return Promise.race([
      this.api.health(),
      timeout
    ])
  }
}
