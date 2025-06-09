# 🧮 EasyStock

**EasyStock** est une application web de gestion de stock composée de trois parties :
- Une API backend développée en .NET
- Un frontend développé en Angular
- Une base de données SQL (fichiers SQL disponibles dans le dossier `sql`)

---

## 🚀 Fonctionnalités principales

- 📦 Suivi des produits et mouvements de stock dans le temps
- 📊 Graphiques d’évolution des stocks
- 🧑‍💼 Gestion des utilisateurs avec rôles (admin, modérateur, rédacteur)
- 🔐 Interface d’administration sécurisée (avec mot de passe critique)
- 🧭 Navigation fluide avec composants Angular standalone

---

## 🛠️ Installation & Lancement

### 📦 1. Lancer l’API (.NET)

Depuis le dossier racine du projet :

```bash
cd EasyStock.API
dotnet build
dotnet run
```

L’API sera accessible sur :
- https://localhost:5200

---

### 💻 2. Lancer le frontend Angular

Revenir à la racine du projet si besoin, puis :

```bash
cd frontend
npm install  # À faire une seule fois
ng serve
```

Le frontend sera accessible sur :
- http://localhost:4200

---

## 📁 Structure du projet

```
EasyStock/
│
├── EasyStock.API/        → Backend .NET
├── frontend/             → Frontend Angular
│   ├── src/
│   ├── angular.json
│   └── README.md
└── sql/                  → Fichiers SQL éventuels
```

---

## 📜 Licence

Projet open source — Licence MIT.

---

## ✍️ Auteur

Développé par NEDJARI Ryan et REDAUD Alexis — 2025  
📫 Contact : ryan.nedjari@ynov.com et alexis.redaud@ynov.com
             
