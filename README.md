# WeCoLearn

Une plateforme collaborative d'étude en temps réel, conçue pour les étudiants. Créez des salles d'étude, chattez, partagez un tableau blanc et gérez votre profil — le tout dans une interface moderne et sécurisée.

---

## Fonctionnalités

- **Authentification** — Connexion via LinkedIn, CNI/NFC ou carte étudiante
- **Salles d'étude** — Créez et rejoignez des rooms en temps réel
- **Chat en direct** — Messagerie instantanée par salle (Socket.IO)
- **Tableau blanc** — Dessin collaboratif avec outils stylo, gomme et couleurs
- **Notes de session** — Éditeur de notes personnel dans chaque salle
- **Caméra** — Activation/désactivation de la webcam dans une salle
- **Profil utilisateur** — Nom, école, rôle, bio — modifiable à tout moment
- **Signalement** — Signalez un utilisateur avec raison et détails
- **Persistance** — Profil sauvegardé en localStorage (reconnexion automatique)

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | HTML, CSS, JavaScript Vanilla |
| Backend | Node.js + Express |
| Temps réel | Socket.IO |
| Base de données | MySQL + Sequelize ORM |

---

## Base de données

Le projet utilise MySQL avec les tables suivantes :

| Table | Description |
|-------|-------------|
| `users` | Profils des utilisateurs enregistrés |
| `logins` | Historique de chaque connexion |
| `rooms` | Salles d'étude créées |
| `room_members` | Membres actifs dans chaque salle |
| `messages` | Historique des messages de chat |
| `reports` | Signalements soumis |

---

## Installation

### Prérequis
- Node.js v18+
- MySQL en local ou distant

### Etapes

**1. Cloner le projet**
```bash
git clone https://github.com/BMWiame/wecolearnppp.git
cd wecolearnppp
```

**2. Installer les dépendances**
```bash
npm install
```

**3. Créer la base de données MySQL**
```sql
CREATE DATABASE wecolearn;
```

**4. Configurer les variables d'environnement**

Créez un fichier `.env` à la racine :
```env
DB_NAME=wecolearn
DB_USER=root
DB_PASS=votre_mot_de_passe
DB_HOST=localhost
PORT=3000
```

**5. Lancer le serveur**
```bash
npm start
```

**6. Ouvrir dans le navigateur**
```
http://localhost:3000
```

Les tables MySQL sont créées automatiquement au démarrage.

---

## API REST

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/users` | Créer un utilisateur |
| `PATCH` | `/api/users/:id` | Modifier un profil |
| `GET` | `/api/rooms` | Lister les salles actives |
| `POST` | `/api/rooms` | Créer une salle |
| `DELETE` | `/api/rooms/:id` | Fermer une salle |
| `GET` | `/api/rooms/:id/messages` | Historique du chat |
| `GET` | `/api/rooms/:id/participants` | Membres d'une salle |
| `POST` | `/api/reports` | Soumettre un signalement |
| `GET` | `/api/admin/logins` | Historique des connexions |
| `GET` | `/api/admin/reports` | Liste des signalements |

---

## Auteure

**Wiame Boumalik** — [@BMWiame](https://github.com/BMWiame)

---

## Licence

Ce projet est open source sous licence MIT.
