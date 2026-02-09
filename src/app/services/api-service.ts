import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';

/**
 * ApiService
 *
 * Zentrale HTTP-Abstraktion für die Kommunikation mit dem Backup-Backend.
 *
 * Ziel
 * - Verwaltung der Serververbindung über IP und Port
 * - Aufbau der API-Base-URL
 * - Bereitstellung typisierter Methoden für Backup-Operationen
 * - Healthcheck des Backends
 *
 * Verantwortlichkeiten
 * - Lädt gespeicherte Serververbindung aus Preferences
 * - Persistiert neue Verbindung über setConnection
 * - Validiert IP und Port
 * - Baut Base-URL für alle Requests
 * - Erstellt standardisierte Header mit API-Key
 * - Kapselt HTTP-Requests hinter Promise-Methoden
 * - Stellt Endpunkte für list, latest, export, import, health bereit
 *
 * Persistenz
 * - Preferences Key 'server_ip'
 * - Preferences Key 'server_port'
 * - Werte werden beim Start geladen und im Service gehalten
 *
 * Abhängigkeiten
 * @dependency HttpClient
 *   - GET und POST Requests zum Backend
 *
 * @dependency Preferences
 *   - Laden und Speichern von IP und Port
 *
 * @dependency environment
 *   - apiKey für Backend-Authentifizierung
 *
 * Nebenwirkungen
 * - Netzwerkrequests zum Backend
 * - Persistiert Serververbindung lokal
 * - Wirft Fehler bei ungültiger Konfiguration oder fehlender Base-URL
 *
 * Invarianten
 * - baseUrl ist gesetzt sobald IP und Port vorhanden sind
 * - Alle Requests nutzen denselben API-Key Header
 * - IP muss interne Adresse sein
 * - Port liegt zwischen 1 und 65535
 * - Methoden geben Promises mit typisierten Responses zurück
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

  
  async init(){
    const ipRes = await Preferences.get({ key: 'server_ip' });
    const portRes = await Preferences.get({ key: 'server_port' });

    this.ip = ipRes.value ?? '';
    this.port = portRes.value ?? '';

    if(this.ip && this.port){ this.buildBaseUrl()};
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


  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-API-KEY': this.apiKey,
    });
  }


  private url(path: string): string {
    const base = this.getBaseUrl().replace(/\/+$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }


  async list(app: string): Promise<BackupFileInfo[]>{
    const res = await firstValueFrom(
      this.http.get<BackupListRes>(
        this.url(`/backups/?app=${encodeURIComponent(app)}`),
        { headers: this.headers()},
      )
    );
    return res.items ?? [];
  }

 
  async latest(app: string): Promise<BackupLatestRes> {
    return await firstValueFrom(
      this.http.get<BackupLatestRes>(
        this.url(`/backups/latest/?app=${encodeURIComponent(app)}`), 
        { headers: this.headers(),}
      )
    );
  }


  async export<TPayload>(app: string, body: BackupExportReq<TPayload>): Promise<BackupExportRes> {
    return await firstValueFrom(
      this.http.post<BackupExportRes>(
        this.url(`/backups/export/`),
        { app, ...body },
        { headers: this.headers()}
      )
    );
  }


  async import<TPayload>(req: BackupImportReq): Promise<BackupImportRes<TPayload>> {
    return await firstValueFrom(
      this.http.post<BackupImportRes<TPayload>>(
        this.url(`/backups/import/`),
        req, 
        { headers: this.headers()}
      )
    );
  }


  async health(): Promise<{ status: 'ok' }> {
    return await firstValueFrom(
      this.http.get<{ status: 'ok' }>(
        this.url('/health'),
        { headers: new HttpHeaders({ Accept: 'application/json' }) }
      )
    );
  }
}
