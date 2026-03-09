# PIN Safe

Self-hosted **secure PIN storage system** for a mobile Android application.

The system allows fast **offline access via PIN or biometrics**, while optionally retrieving a secure token from a NAS when a network connection is available.

---

## Badges

![Ionic](https://img.shields.io/badge/Ionic-framework-blue)
![Angular](https://img.shields.io/badge/Angular-framework-red)
![Capacitor](https://img.shields.io/badge/Capacitor-mobile--runtime-blue)
![Android](https://img.shields.io/badge/Android-supported-green)
![Biometric](https://img.shields.io/badge/Biometric-authentication-orange)
![HTTP](https://img.shields.io/badge/API-HTTP--Client-lightgrey)

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

## Architectur
```text
+------------------------------+
|          Android App         |
|  Ionic + Angular + Capacitor |
+--------------+---------------+
               |
               | HTTP Request
               v
+------------------------------+
|            Server            |
|    Secure Backup Storage     |
+------------------------------+
```

---


## Configuration

The token used in the mobile client must match the **static token configured on the server**.

Example configuration:

```javascript
token: "CHANGE_ME"
```

