import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';


/**
 * The ApiService is responsible for managing the connection to the backup API and providing methods to interact with it. 
 * It handles the initialization of the connection parameters (IP and port), validates them, and provides methods for listing backups, 
 * retrieving the latest backup, exporting backups, and importing backups. 
 * The service uses Angular's HttpClient to make HTTP requests to the backup API and includes error handling for connection issues. 
 * It also ensures that the API key is included in the headers of each request for authentication purposes.
 * 
 * Note: The actual structure of the backup file information, export/import request and response payloads may vary based on the specific implementation of the backup API.
 * @see {@link BackupFileInfo} for the structure of backup file information.
 * @see {@link BackupExportReq} for the structure of the backup export request payload.
 * @see {@link BackupExportRes} for the structure of the backup export response payload.
 * @see {@link BackupListRes} for the structure of the backup list response payload.
 * @see {@link BackupLatestRes} for the structure of the latest backup response payload.
 * @see {@link BackupImportReq} for the structure of the backup import request payload.
 * @see {@link BackupImportRes} for the structure of the backup import response payload.
 */


export interface BackupFileInfo{
  filename: string;
  path: string;
  bytes: number;
  modifiedAt: string;
}

export interface BackupExportReq<TPayload = any>{
  schemaVersion: number;
  payload: TPayload;
  meta?: any;
}

export interface BackupExportRes{
  message: string
  file: BackupFileInfo;
}

export interface BackupListRes{
  app: string;
  count: number;
  items: BackupFileInfo[];
}

export interface BackupLatestRes{
  app: string;
  latest: BackupFileInfo | null;
}

export interface BackupImportReq{
  app: string;
  path: string;
}

export interface BackupImportRes<TPayload = any>{
  app: string;
  schemaVersion: number;
  exportedAt: string;
  payload: TPayload;
}


@Injectable({ providedIn: 'root'})


export class ApiService {
  private baseUrl: string = '';
  private port: string = '';
  private ip: string = '';
  private readonly apiKey = environment.backupApi.apiKey;

  constructor(private http: HttpClient){}

  /**
   * @description Initializes the ApiService by retrieving the server IP and port from preferences and building the base URL if both are available.
   * @returns Promise<void> - A promise that resolves when the initialization is complete.
   */
  async init(){
    const ipRes = await Preferences.get({ key: 'server_ip' });
    const portRes = await Preferences.get({ key: 'server_port' });

    this.ip = ipRes.value ?? '';
    this.port = portRes.value ?? '';

    if(this.ip && this.port){ this.buildBaseUrl()};
  }


  /**
   * @description Sets the connection parameters (IP and port) for the backup API, validates them, saves them to preferences, and builds the base URL for API requests.
   * @param ip 
   * @param port 
   * @returns Promise<void> - A promise that resolves when the connection parameters have been set and the base URL has been built.
   * @throws Error if the IP address is not a valid internal IP or if the port number is invalid.
   */
  async setConnection(ip: string, port: string){
    this.validate(ip, port);

    this.ip = ip;
    this.port = port;
    
    await Preferences.set({ key: 'server_ip', value: ip });
    await Preferences.set({ key: 'server_port', value: port});

    this.buildBaseUrl();
  }

  /**
   * @description Retrieves the current connection parameters (IP and port) for the backup API.
   * @returns {ip: string, port: string} - The current connection parameters.
   */
  getConnection(){
    return {ip: this.ip, port: this.port };
  }


  /**
   * @description 
   * Builds the base URL for API requests using the current IP and port values. 
   * This method is called after validating and setting the connection parameters to ensure that the base URL is correctly constructed for subsequent API interactions.
   * @returns void
   * @throws Error if the IP or port values are not set before calling this method.
   */
  private buildBaseUrl(){
    this.baseUrl = `http://${this.ip}:${this.port}/api`;
  }


  /**
   * @description Validates the provided IP address and port number to ensure they are in the correct format and within acceptable ranges.
   * @throws Error if the IP address is not a valid internal IP or if the port number is invalid.
   * @param ip 
   * @param port 
   */
  private validate(ip: string, port: string){
    const ipRegex = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))([0-9]{1,3}\.){1,2}[0-9]{1,3}$/;
    if(!ipRegex.test(ip)){throw new Error('Nur interne IP erlaubt');}

    const p = parseInt(port, 10);
    if(!p || p < 1 || p > 65535){ throw new Error('Port ungültig')};
  }


  /**
   * @description Retrieves the base URL for API requests. This method checks if the base URL has been set and throws an error if it has not, ensuring that API requests are only made when a valid connection has been established.
   * @throws Error if the base URL has not been set, indicating that the server connection parameters have not been properly configured.  
   * @returns string - The base URL for API requests.
   */
  private getBaseUrl(): string{
    if(!this.baseUrl){throw new Error('Server nicht gesetzt');}
    return this.baseUrl
  }


  /**
   * @description Constructs the HTTP headers for API requests, including the API key for authentication.
   * @returns HttpHeaders - The constructed HTTP headers. 
   */
  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-API-KEY': this.apiKey,
    });
  }


  /**
   * @description constructs the full URL for a given API path.
   * @param path string - The API path to append to the base URL.
   * @returns string - The full URL.
   */
  private url(path: string): string {
    const base = this.getBaseUrl().replace(/\/+$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }


  /**
   * @description Lists backup files for a given application.
   * @param app string - The application identifier.
   * @returns Promise<string[]> - A promise that resolves to an array of backup file names.
   */
  async list(app: string): Promise<BackupFileInfo[]>{
    const res = await firstValueFrom(
      this.http.get<BackupListRes>(
        this.url(`/backups/?app=${encodeURIComponent(app)}`),
        { headers: this.headers()},
      )
    );
    return res.items ?? [];
  }


  /**
   * @description Retrieves the latest backup for a given application.
   * @param app string - The application identifier.   
   * @returns Promise<BackupLatestRes> - A promise that resolves to the latest backup response.             
   */
  async latest(app: string): Promise<BackupLatestRes> {
    return await firstValueFrom(
      this.http.get<BackupLatestRes>(
        this.url(`/backups/latest/?app=${encodeURIComponent(app)}`), 
        { headers: this.headers(),}
      )
    );
  }


  /**
   * @description 
   * Exports a backup for a given application with the provided payload and metadata. 
   * The method sends a POST request to the backup API to create a new backup file based on the provided data.
   * @param app string - The application identifier.
   * @param body BackupExportReq<TPayload> - The backup export request payload.
   * @returns Promise<BackupExportRes> - A promise that resolves to the backup export response. 
   */
  async export<TPayload>(app: string, body: BackupExportReq<TPayload>): Promise<BackupExportRes> {
    return await firstValueFrom(
      this.http.post<BackupExportRes>(
        this.url(`/backups/export/`),
        { app, ...body },
        { headers: this.headers()}
      )
    );
  }


  /**
   * @description Imports a backup for a given application from the specified backup file path.
   * @param app string - The application identifier.
   * @param path string - The path to the backup file to be imported.
   * @returns Promise<BackupImportRes<TPayload>> - A promise that resolves to the backup import response. 
   */
  async import<TPayload>(req: BackupImportReq): Promise<BackupImportRes<TPayload>> {
    return await firstValueFrom(
      this.http.post<BackupImportRes<TPayload>>(
        this.url(`/backups/import/`),
        req, 
        { headers: this.headers()}
      )
    );
  }


  /**
   * @description For debugging: Checks the health status of the backup API service.
   * @returns Promise<{ ok: boolean; storage_writable?: boolean; time?: string; error?: string }> - A promise that resolves to the health status response.
   */
  async health(): Promise<{ status: 'ok' }> {
    return await firstValueFrom(
      this.http.get<{ status: 'ok' }>(
        this.url('/health'),
        { headers: new HttpHeaders({ Accept: 'application/json' }) }
      )
    );
  }
}
