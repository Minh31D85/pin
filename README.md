# PIN Safe

Self-hosted **secure PIN storage system** for a mobile Android application.

Built with:

- **Ionic** – Mobile UI framework  
- **Angular** – Frontend framework  
- **Capacitor** – Native mobile runtime 

The system allows fast **offline access via PIN or biometrics**, while optionally retrieving a secure token from a NAS when a network connection is available.

---

## Badges

![Ionic](https://img.shields.io/badge/Ionic-framework-3880FF?logo=ionic&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-framework-DD0031?logo=angular&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-mobile_runtime-119EFF?logo=capacitor&logoColor=white)
![Android](https://img.shields.io/badge/Android-supported-3DDC84?logo=android&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-language-3178C6?logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-language-F7DF1E?logo=javascript&logoColor=black)
![HTML](https://img.shields.io/badge/HTML-markup-E34F26?logo=html5&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-style-CC6699?logo=sass&logoColor=white)
![Java](https://img.shields.io/badge/Java-runtime-007396?logo=openjdk&logoColor=white)
![Biometric](https://img.shields.io/badge/Biometric-authentication-orange)
![HTTP](https://img.shields.io/badge/API-HTTP_Client-lightgrey)
![License](https://img.shields.io/badge/license-all_rights_reserved-red)

---

## Features

**Secure PIN Storage**

- Stores a numeric PIN with **4–8 digits**
- PIN is encrypted and stored in the **secure device storage**

**Biometric Protection**

- Viewing the PIN requires **biometric authentication**
- After successful authentication the PIN is visible for **3 seconds**
- Afterwards the PIN is automatically masked again

**Offline First**

- Works fully offline
- Optional synchronization with a NAS in LAN or VPN

---

## Architecture
```text
+------------------------------+
|          Android App         |
| Ionic + Angular + Capacitor  |
|                              |
|  Secure Local Storage        |
|  PIN + Biometric Access      |
+--------------+---------------+
               |
               | optional HTTP Sync
               v
+------------------------------+
|            Server            |
|        Backup Storage        |
+------------------------------+
```

---


## Configuration

The token used in the mobile client must match the **static token configured on the server**.

Example configuration:

```javascript
token: "CHANGE_ME"
```

---

## License
This project is not open source.

All rights reserved.

The source code is provided for viewing purposes only.

You are not permitted to:

- copy the code
- reuse the code
- redistribute the code
- use the code commercially