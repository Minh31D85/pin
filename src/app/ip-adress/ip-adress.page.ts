import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from '../api-service';

/**
 * This page allows the user to set the IP address and port of the server. 
 * It also performs a health check to ensure the server is reachable before navigating to the login page.
 * The health check is implemented with a timeout to prevent the app from hanging if the server is not reachable. 
 * If the server is reachable, the user is navigated to the login page. If not, an error message is displayed.
 * 
 * Note: The user must have the correct IP address and port of their server for the app to function properly. 
 * If the server is not reachable, the user will not be able to access the login page or any other features of the app.
 */

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

  /**
   * @description 
   * On initialization, the component retrieves the current IP address and port from the API service and sets them to the component's properties. 
   * This allows the user to see the current connection settings when they open the page. If there are no existing settings, it defaults to empty strings.
   */
  ngOnInit(): void {
    const conn = this.api.getConnection();
    this.ip = conn.ip || '';
    this.port = conn.port || '';
  }

  /**
   * @description
   * The saveIp method is responsible for saving the IP address and port entered by the user. 
   * It first checks if a save operation is already in progress to prevent multiple simultaneous saves. 
   * If not, it sets the loading state to true and attempts to save the new connection settings using the API service. 
   * After saving, it performs a health check to ensure the server is reachable with the new settings. 
   * If the health check is successful, it navigates the user to the login page. If any errors occur during this process, an alert is displayed with the error message. 
   * Finally, it resets the loading state to false.
   */
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

  /**
   * @description
   * The timeoutHealthCheck method performs a health check on the server with a timeout mechanism. 
   * It creates a promise that rejects after 3 seconds to serve as a timeout. 
   * It then uses Promise.race to race      the health check promise against the timeout promise.
   * @returns A promise that resolves if the health check is successful within the timeout period, or rejects with an error if the health check fails or if the timeout is reached.
   */
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
