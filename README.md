# School Manager Pro 🎓
### Système de Gestion Scolaire - Le Schéma

> **Innover · Créer · Exceller**

Application de gestion scolaire complète, offline-first, pour établissements privés au Maroc.

---

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** v18 ou supérieur → [nodejs.org](https://nodejs.org)
- **Windows** 10/11 (x64)

### Option 1 : Lancer en mode développement
```bash
npm install
npm start
```
Ou double-cliquer sur **`RUN_DEV.bat`**

### Option 2 : Construire l'EXE portable
```bash
npm install
npm run build:win
```
Ou double-cliquer sur **`BUILD.bat`**

L'EXE sera généré dans : `dist/SchoolManagerPro-Portable.exe`

---

## 🔑 Comptes par Défaut

| Rôle | Utilisateur | Mot de Passe |
|------|-------------|--------------|
| Administrateur | `admin` | `admin123` |
| Comptable | `comptable` | `compta123` |
| Secrétaire | `secretaire` | `secr123` |

> ⚠️ Changez les mots de passe après la première connexion !

---

## 📋 Fonctionnalités

### ✅ Implémentées
- 🔐 **Authentification** — 3 rôles (Admin, Comptable, Secrétaire)
- 📊 **Dashboard** — Statistiques, graphiques temps réel
- 🎓 **Élèves** — CRUD complet, profils, historique
- 💳 **Paiements** — Mensualités, assurance, transport + reçus PDF
- 👨‍💼 **Employés** — Gestion des salaires, primes, avances
- 💸 **Dépenses** — Fixes et variables avec catégorisation
- 🚌 **Transport** — Gestion des bus et abonnements
- 📅 **Emploi du Temps** — Grille hebdomadaire par classe
- 📁 **Documents** — Archivage des fichiers
- 📈 **Rapports** — Export PDF & Excel
- ⚙️ **Paramètres** — Configuration école
- 💾 **Sauvegarde** — Auto quotidienne + manuelle

### 🏫 Classes Supportées
PS · MS · GS · CP · CE1 · CE2 · CM1 · CM2 · 6EME · 1AC · 2AC · 3AC · TC · 1BAC · 2BAC

---

## 🗄️ Base de Données

- **SQLite** — Base de données locale, aucun serveur requis
- Stockée dans : `%APPDATA%/school-manager-pro/`
- Sauvegardes automatiques quotidiennes
- Export manuel possible

---

## 🛠️ Stack Technique

| Technologie | Usage |
|-------------|-------|
| **Electron 28** | Framework desktop |
| **React 18** | Interface utilisateur |
| **TailwindCSS 3** | Styles |
| **SQLite (better-sqlite3)** | Base de données |
| **Chart.js 4** | Graphiques dashboard |
| **jsPDF + jspdf-autotable** | Génération PDF |
| **SheetJS (xlsx)** | Export Excel |

---

## 📁 Structure du Projet

```
school-manager-pro/
├── electron/
│   ├── main.js          # Processus principal Electron + IPC handlers
│   └── preload.js       # Bridge sécurisé renderer ↔ main
├── src/
│   ├── pages/           # Pages de l'application
│   ├── components/      # Composants réutilisables
│   ├── utils/           # Utilitaires (générateur PDF reçus)
│   ├── App.js           # Routage + contextes
│   └── index.css        # Styles globaux
├── public/
│   ├── index.html
│   └── logo.jpeg        # Logo Le Schéma
├── prisma/
│   └── schema.prisma    # Schéma base de données
├── BUILD.bat            # Script de build Windows
└── RUN_DEV.bat          # Script développement Windows
```

---

## 🎨 Design

- **Thème sombre** professionnel (style ERP)
- Couleurs: Orange (#f97316) + Or (#b8975a)
- Police: DM Sans + Playfair Display + Amiri (Arabe)
- Interface bilingue Français / Arabe

---

## 📞 Support

**Le Schéma** · Innover · Créer · Exceller  
© 2026 Tous droits réservés
