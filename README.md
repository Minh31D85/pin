## Überblick

Dieses Projekt implementiert einen lokalen PIN Safe für eine mobile Android App mit optionaler NAS Anbindung im LAN oder über VPN. Ziel ist ein schneller Offline Zugang per PIN oder Biometrie sowie ein sicherer Token Abruf vom NAS sobald eine Verbindung besteht.

## Funktion

Speichert eine numerische PIN mit vier bis acht Stellen zusammen mit einem Namen.
PIN wird verschlüsselt im sicheren Gerätespeicher abgelegt.
Zum Anzeigen ist biometrische Authentifizierung nötig.
Nach erfolgreicher Biometrie wird die PIN drei Sekunden sichtbar, danach wird sie wieder maskiert.

## Voraussetzungen

Ionic Angular Capacitor.

Android Studio.

Biometrie Plugin für Capacito

HTTP Client.

Server mit identischem ApiKey.

## Environment Konfiguration
Der Token im Client muss identisch mit dem statischen Token auf dem Server sein.

```bash
token: 'CHANGE_ME'
```
Beispiel Header:

Authorization: Bearer CHANGE_ME
