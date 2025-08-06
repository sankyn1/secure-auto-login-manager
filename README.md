# Secure Auto Login Manager 🔒

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-%E2%98%95-yellow?style=for-the-badge)](https://www.buymeacoffee.com/shivshankarnamdev)

A privacy-first Chrome Extension that securely auto-fills and logs you into websites using credentials stored **locally** in your browser.  
No Cloud. No 3rd-Party Access. **You own your data.**

---

## 🚀 Features
- ✅ **Local Storage Only** – Credentials are stored in Chrome's local storage (offline).
- ✅ **One-Click Auto-Login** – Select a saved site from the sidebar and auto-fill/login.
- ✅ **Import/Export Backup** – Quickly migrate or backup your saved sites.
- ✅ **Side Panel Dock** – Clean and accessible dock for all your sites.
- ✅ **Lightweight & Fast** – Minimal resource usage.
- ✅ **Open Source & Transparent** – You can audit or modify the code as you wish.

---

## 🖥️ Screenshots

| Side Panel View | Add Site Modal |
|-----------------|----------------|
| ![Panel View](https://dummyimage.com/300x200/1976d2/ffffff&text=Site+List+Panel) | ![Modal View](https://dummyimage.com/300x200/43a047/ffffff&text=Add+Site+Modal) |

---

## 📦 Installation

### Method 1: Load Unpacked Extension (Developer Mode)
1. Clone or Download this repository.
2. Open **chrome://extensions/** in Chrome.
3. Enable **Developer Mode** (top-right corner).
4. Click **"Load Unpacked"**.
5. Select the project folder.

### Method 2: Manual ZIP Upload
1. Compress the entire folder (`manifest.json` should be at root level).
2. Load it as unpacked in Chrome.

---

## 🛠️ Usage Guide
1. Open Chrome Side Panel via extension icon.
2. Click **Add Site (+)** to store your website credentials.
3. Click on the site name to open and auto-login.
4. Use **Export** to back up your saved sites.
5. Use **Import** to load saved sites from a backup file.

---

## 🗃️ Import/Export JSON Format
```json
[
  {
    "name": "Example Site",
    "url": "https://example.com",
    "loginUrl": "https://example.com/login",
    "username": "your_username",
    "password": "your_password"
  }
]
