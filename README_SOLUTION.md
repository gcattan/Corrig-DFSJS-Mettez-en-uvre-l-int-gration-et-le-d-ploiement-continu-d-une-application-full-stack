# Orion CRM - Solution Complète

Cette version contient l'implémentation complète avec tous les éléments CI/CD, conteneurisation optimisée, et monitoring.

## Différences avec le Starter

### Docker (Optimisations)

#### Backend Dockerfile
- ✅ Multi-stage build (builder + production)
- ✅ Image Alpine (node:22-alpine) - plus petite et sécurisée
- ✅ Utilisateur non-root (nodejs:nodejs)
- ✅ Séparation deps build/production (npm ci --only=production)
- ✅ Health check intégré
- ✅ Optimisation layers (COPY package*.json d'abord)
- ✅ dumb-init pour gestion signaux
- ✅ Cache npm nettoyé

**Taille image** : ~200MB (vs ~1.2GB pour la version basique)

#### Frontend Dockerfile
- ✅ Multi-stage build (Node builder + Nginx serve)
- ✅ Images Alpine
- ✅ Nginx pour serving statique optimisé
- ✅ Utilisateur non-root
- ✅ Configuration nginx custom
- ✅ Compression gzip
- ✅ Security headers
- ✅ Health check

**Taille image** : ~50MB (vs ~1.1GB pour la version basique)

#### docker-compose.yml
- ✅ Orchestration complète backend + frontend
- ✅ Network bridge dédié
- ✅ Volumes persistants pour données
- ✅ Health checks et depends_on
- ✅ Restart policies
- ✅ Variables d'environnement

#### .dockerignore
- ✅ Exclusion node_modules, dist, .env
- ✅ Optimisation build context
- ✅ Réduction taille images

### CI/CD (GitHub Actions)

#### ci.yml - Continuous Integration
**Jobs** :
1. **backend-ci** : lint, tests, build backend
2. **frontend-ci** : lint, tests, build frontend
3. **sonarqube** : analyse qualité/sécurité du code

**Features** :
- Cache npm pour accélérer les builds
- Artifacts uploadés (dist files)
- SonarQube Quality Gate
- Exécution parallèle des jobs

#### cd.yml - Continuous Deployment
**Jobs** :
1. **build-and-push** : Build et push images Docker vers GHCR

**Features** :
- Login GHCR automatique
- Tags multiples (branch, sha, semver)
- Docker Buildx pour multi-platform
- Cache GitHub Actions
- Metadata extraction

#### release.yml - Releases Automatiques
**Déclencheur** : Tags `v*.*.*` (ex: v1.0.0)

**Features** :
- Build complet backend + frontend
- Archives .tar.gz des builds
- Génération changelog automatique
- Release GitHub avec artefacts
- Versioning sémantique

### SonarQube Cloud

#### sonar-project.properties
Configuration complète :
- Sources : client/src + server/src
- Tests inclusions : *.test.ts, *.spec.ts
- Exclusions : node_modules, dist, coverage
- Coverage reports : lcov.info
- Quality gate activé

**Règles analysées** :
- Bugs
- Vulnerabilities
- Code Smells
- Security Hotspots
- Code Coverage
- Code Duplications
- Complexity

### ELK Stack (Monitoring Local)

#### docker-compose.elk.yml
Stack complète :
- **Elasticsearch** : Stockage logs (port 9200)
- **Logstash** : Traitement logs (port 5044)
- **Kibana** : Visualisation (port 5601)

#### elk/logstash.conf
Pipeline configuré :
- Input : Beats (port 5044) + TCP (port 5000)
- Filter : Parsing JSON, timestamps, log levels
- Output : Elasticsearch + stdout

**Utilisation** :
```bash
docker-compose -f docker-compose.elk.yml up
# Accéder Kibana: http://localhost:5601
```

## Architecture de la Solution

### Backend (Server)

```
server/
├── src/
│   ├── controllers/       # HTTP handlers (validation input, appel services)
│   ├── services/          # Business logic (règles métier)
│   ├── repositories/      # Data access (Prisma queries)
│   ├── models/            # Zod schemas (validation)
│   ├── routes/            # Express routes
│   └── index.ts           # Server entry point
├── prisma/
│   └── schema.prisma      # Database schema
├── Dockerfile             # OPTIMIZED multi-stage
├── .dockerignore          # Build optimization
└── package.json
```

**Pattern** : Controller → Service → Repository
- Controllers : Validation (Zod) + HTTP
- Services : Logique métier + erreurs
- Repositories : Queries Prisma uniquement

### Frontend (Client)

```
client/
├── src/
│   ├── components/        # Reusable UI (Layout, Card)
│   ├── pages/             # Route components (Dashboard, Lists)
│   ├── hooks/             # Custom hooks (TanStack Query)
│   ├── services/          # API calls (Axios)
│   ├── types/             # TypeScript interfaces
│   ├── App.tsx            # Router setup
│   └── main.tsx           # Entry point
├── nginx.conf             # Nginx config (security, caching, SPA)
├── Dockerfile             # OPTIMIZED multi-stage (Node + Nginx)
├── .dockerignore
└── package.json
```

**Pattern** : Pages → Components → Hooks → Services → API
- Pages : Layout + data fetching (hooks)
- Components : UI pure (props)
- Hooks : TanStack Query (cache, mutations)
- Services : Axios centralisé

### CI/CD Pipeline

```
Git Push → GitHub Actions
    ↓
┌─────────────────────────────┐
│ CI (ci.yml)                 │
├─────────────────────────────┤
│ 1. Backend CI               │
│    - npm ci                 │
│    - lint                   │
│    - test                   │
│    - build                  │
│ 2. Frontend CI              │
│    - npm ci                 │
│    - lint                   │
│    - test                   │
│    - build                  │
│ 3. SonarQube                │
│    - Code analysis          │
│    - Quality Gate           │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ CD (cd.yml) - on main only  │
├─────────────────────────────┤
│ 1. Build Docker Images      │
│    - Backend multi-stage    │
│    - Frontend multi-stage   │
│ 2. Push to GHCR             │
│    - ghcr.io/.../backend    │
│    - ghcr.io/.../frontend   │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Release (release.yml)       │
│ Trigger: Tag v*.*.*         │
├─────────────────────────────┤
│ 1. Build artifacts          │
│ 2. Generate changelog       │
│ 3. Create GitHub Release    │
│ 4. Upload .tar.gz           │
└─────────────────────────────┘
```

## Métriques DORA

### Lead Time for Changes
**Mesure** : Temps entre commit et déploiement
**Calcul** : GitHub Actions duration (CI + CD)
**Cible** : < 1 heure

### Deployment Frequency
**Mesure** : Nombre de déploiements / semaine
**Calcul** : Historique GitHub Actions (cd.yml)
**Cible** : Multiple fois par jour

### Mean Time to Restore (MTTR)
**Mesure** : Temps pour restaurer après incident
**Calcul** : Temps entre détection (logs ELK) et fix déployé
**Cible** : < 1 heure

### Change Failure Rate
**Mesure** : % de déploiements causant un problème
**Calcul** : (Rollbacks / Total deployments) × 100
**Cible** : < 15%

## KPI Personnalisés

### Performance Pipeline
- **Temps build backend** : ~2-3 min
- **Temps build frontend** : ~3-4 min
- **Temps total CI** : ~5-7 min
- **Temps CD (images)** : ~10-15 min

### Qualité Code (SonarQube)
- **Coverage** : > 80%
- **Bugs** : 0 (bloquant)
- **Vulnerabilities** : 0 (critique/haute)
- **Code Smells** : < 50
- **Debt Ratio** : < 5%

### Monitoring (ELK)
- **Logs collectés** : 100% des événements
- **Erreurs API** : Taux < 1%
- **Temps réponse API** : P95 < 200ms

## Plan de Sécurité

### Dockerfile Security
- ✅ Images officielles Alpine
- ✅ Utilisateurs non-root
- ✅ Pas de secrets dans images
- ✅ Multi-stage (pas de build tools en prod)
- ✅ Health checks
- ✅ Minimal attack surface

### Application Security
- ✅ Validation Zod (backend)
- ✅ TypeScript strict (no any)
- ✅ CORS configuré
- ✅ Security headers (Nginx)
- ✅ Secrets via environment variables
- ✅ Dependencies audit (npm audit)

### CI/CD Security
- ✅ Secrets GitHub (SONAR_TOKEN, GITHUB_TOKEN)
- ✅ SonarQube analysis (OWASP Top 10)
- ✅ Quality Gates bloquants
- ✅ Image scanning (recommandé: Trivy)

## Plan de Sauvegarde

### Données Application
- **Quoi** : Base SQLite (prod.db)
- **Où** : Volume Docker `backend-data`
- **Fréquence** : Daily backup (cronjob recommandé)
- **Méthode** : `docker cp` ou volume backup

```bash
# Backup
docker cp orion-crm-backend:/data/prod.db ./backups/prod-$(date +%Y%m%d).db

# Restore
docker cp ./backups/prod-20260122.db orion-crm-backend:/data/prod.db
```

### Artefacts Build
- **Quoi** : dist/ backend + frontend
- **Où** : GitHub Actions artifacts + Releases
- **Rétention** : 7 jours (artifacts), permanent (releases)

### Images Docker
- **Quoi** : Images taguées
- **Où** : GHCR (GitHub Container Registry)
- **Rétention** : Toutes les versions

## Plan de Mise à Jour

### Dependencies
```bash
# Check outdated
npm outdated

# Update minor/patch
npm update

# Update major (review changelog first)
npm install package@latest
```

**Fréquence** : Monthly security updates, quarterly major updates

### Docker Images Base
```bash
# Update to latest Node 22 Alpine
FROM node:22-alpine  # Auto-updated on rebuild
```

**Fréquence** : Rebuild mensuel

### CI/CD Actions
```yaml
# GitHub Actions versions
uses: actions/checkout@v4  # Check for @v5
uses: actions/setup-node@v4
```

**Fréquence** : Quarterly review

## Commandes Utiles

### Développement Local
```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm run dev

# Database
cd server && npx prisma studio
```

### Docker Local
```bash
# Build et run
docker-compose up --build

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop
docker-compose down
```

### ELK Stack
```bash
# Start ELK
docker-compose -f docker-compose.elk.yml up

# Accès Kibana
open http://localhost:5601

# Test Logstash
echo '{"level":"INFO","message":"Test log"}' | nc localhost 5000
```

### CI/CD Local Test
```bash
# Install act (GitHub Actions locally)
brew install act

# Run CI workflow
act -W .github/workflows/ci.yml
```

## Secrets Requis (GitHub)

Pour que les workflows fonctionnent :

1. **SONAR_TOKEN** : Token SonarQube Cloud
2. **SONAR_HOST_URL** : https://sonarcloud.io
3. **GITHUB_TOKEN** : Auto-fourni par GitHub Actions

Configuration : Settings → Secrets and variables → Actions

## Ressources

- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SonarQube Cloud](https://sonarcloud.io/)
- [ELK Stack Documentation](https://www.elastic.co/guide/index.html)
- [DORA Metrics](https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance)
