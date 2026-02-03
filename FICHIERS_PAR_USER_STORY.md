# Fichiers par User Story

## 📋 US-01 : Ajouter un achat

### Backend
```
backendp_i/src/entities/product.entity.ts          [CRÉÉ]
backendp_i/src/entities/purchase.entity.ts        [CRÉÉ]
backendp_i/src/purchases/dto/create-purchase.dto.ts [CRÉÉ]
backendp_i/src/purchases/purchases.service.ts     [CRÉÉ - méthode create()]
backendp_i/src/purchases/purchases.controller.ts   [CRÉÉ - POST /achats]
backendp_i/src/purchases/purchases.module.ts       [CRÉÉ]
backendp_i/src/app.module.ts                       [MODIFIÉ - config TypeORM]
backendp_i/src/main.ts                             [MODIFIÉ - ValidationPipe + CORS]
```

### Frontend
```
panier-intelligent/src/App.tsx                     [MODIFIÉ - formulaire ajout]
panier-intelligent/src/App.css                     [MODIFIÉ - styles formulaire]
```

---

## 📋 US-02 : Consulter l'historique des achats

### Backend
```
backendp_i/src/purchases/purchases.service.ts     [MODIFIÉ - méthode findAll()]
backendp_i/src/purchases/purchases.controller.ts  [MODIFIÉ - GET /achats]
backendp_i/src/purchases/dto/get-purchases-query.dto.ts [CRÉÉ]
```

### Frontend
```
panier-intelligent/src/App.tsx                     [MODIFIÉ - onglet Historique]
panier-intelligent/src/App.css                     [MODIFIÉ - styles historique]
```

---

## 📋 US-03 : Analyser le produit le plus acheté (Top produit)

### Backend
```
backendp_i/src/purchases/purchases.service.ts     [MODIFIÉ - méthode findTopProduct()]
backendp_i/src/purchases/purchases.controller.ts  [MODIFIÉ - GET /achats/top-produit]
```

### Frontend
```
panier-intelligent/src/App.tsx                     [MODIFIÉ - onglet Top Produit]
panier-intelligent/src/App.css                     [MODIFIÉ - styles top produit]
```

---

## 📋 US-04 : Consulter le bilan financier

### Backend
```
backendp_i/src/purchases/purchases.service.ts     [MODIFIÉ - méthode getTotalAmount()]
backendp_i/src/purchases/purchases.controller.ts  [MODIFIÉ - GET /achats/bilan]
```

### Frontend
```
panier-intelligent/src/App.tsx                     [MODIFIÉ - onglet Bilan Financier]
panier-intelligent/src/App.css                     [MODIFIÉ - styles bilan]
```

---

## 🔧 Fichiers communs (toutes les US)

### Backend
```
backendp_i/src/entities/product.entity.ts          [CRÉÉ - utilisé par toutes]
backendp_i/src/entities/purchase.entity.ts        [CRÉÉ - utilisé par toutes]
backendp_i/src/purchases/purchases.module.ts       [CRÉÉ - module principal]
backendp_i/src/app.module.ts                       [MODIFIÉ - config globale]
backendp_i/src/main.ts                             [MODIFIÉ - config globale]
```

### Frontend
```
panier-intelligent/src/App.tsx                     [MODIFIÉ - contient toutes les US]
panier-intelligent/src/App.css                     [MODIFIÉ - styles complets]
panier-intelligent/src/index.css                   [MODIFIÉ - thème clair global]
```

---

## 📊 Statistiques

- **Fichiers backend créés** : 7
- **Fichiers backend modifiés** : 3
- **Fichiers frontend modifiés** : 3
- **Total fichiers** : 13
