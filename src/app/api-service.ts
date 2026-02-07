import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';

export interface BackupFileInfo{
  filename: string;
  path: string;
  bytes: number;
  modifiedAt: string;
}

/**
 * @description Request payload for exporting a backup.
 * @template TPayload - The type of the payload to be backed up.
 */
export interface BackupExportReq<TPayload = any>{
  schemaVersion: number;
  payload: TPayload;
  meta?: any;
};

/**
 * @description Response payload for exporting a backup.
 */
export interface BackupExportRes{
  message: string
  file: BackupFileInfo;
};

/**
 * @description Response payload for listing backup files.
 */
export interface BackupListRes{
  app: string;
  count: number;
  items: BackupFileInfo[];
};

/**
 * @description Response payload for retrieving the latest backup.
 * @template TBackup - The type of the backup payload.
 */
export interface BackupLatestRes{
  app: string;
  latest: BackupFileInfo | null;
}

export interface BackupImportReq{
  app: string;
  path: string;
}

/**
 * @description Response payload for importing a backup.
 * @template TPayload - The type of the payload that was backed up.
 */
export interface BackupImportRes<TPayload = any>{
  app: string;
  schemaVersion: number;
  exportedAt: string;
  payload: TPayload;
};

;

@Injectable({ providedIn: 'root'})

export class ApiService {
  /**
   * @description Base URL for the backup API.API key for authenticating requests to the backup API.
   */
  private baseUrl: string = '';
  private port: string = '';
  private ip: string = '';
  private readonly apiKey = environment.backupApi.apiKey;

  constructor(private http: HttpClient){}

  async init(){
    const ipRes = await Preferences.get({ key: 'server_ip' });
    const portRes = await Preferences.get({ key: 'server_port' });

    this.ip = ipRes.value ?? '';
    this.port = portRes.value ?? '';

    if(this.ip && this.port){ this.buildBaseUrl()};
    //debugging
    console.log('INIT', this.ip, this.port);
  }

  async setConnection(ip: string, port: string){
    this.validate(ip, port);

    this.ip = ip;
    this.port = port;
    
    await Preferences.set({ key: 'server_ip', value: ip });
    await Preferences.set({ key: 'server_port', value: port});

    this.buildBaseUrl();
  }

  getConnection(){
    return {ip: this.ip, port: this.port };
  }

  private buildBaseUrl(){
    this.baseUrl = `http://${this.ip}:${this.port}/api`;
  }

  private validate(ip: string, port: string){
    const ipRegex = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))([0-9]{1,3}\.){1,2}[0-9]{1,3}$/;

    if(!ipRegex.test(ip)){throw new Error('Nur interne IP erlaubt');}

    const p = parseInt(port, 10);

    if(!p || p < 1 || p > 65535){ throw new Error('Port ungültig')};
  }

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
   * @description Exports a backup for a given application.
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
   * @description Imports a backup for a given application from a specified path.
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
