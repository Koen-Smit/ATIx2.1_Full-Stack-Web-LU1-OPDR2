# ATIx2.1 Full-Stack Keuze Kompas
Een full-stack webapplicatie met Angular frontend en NestJS backend.

## Project Structuur
```
client/     - Angular frontend applicatie
server/     - NestJS backend API
```
## Ports/local
- Client (Angular): http://localhost:4200
- Server (NestJS): http://localhost:3000

---

## Installatie
### Alle dependencies installeren
(bij server en client apart, niet in de root.)
```bash
cd locatie(server/client)
npm install
```

---

## Development Commands
### Starten
Zorg dat beide draaien als je client wil gebruiken, tests vereisen beide actief.
```bash
cd locatie(server/client)
npm run start              
npm run build           
npm run test            
```

## MongoDB structuur

### Users Collection
```json
{
  "_id": "ObjectId",
  "firstname": "string",
  "lastname": "string", 
  "email": "string",
  "password": "string",
  "favorites": [
    {
      "module_id": "ObjectId",
      "added_at": "Date",
      "module_name": "string",
      "studycredit": "number",
      "location": "string"
    }
  ],
  "created_at": "Date",
  "updated_at": "Date"
}
```

### Modules Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "shortdescription": "string",
  "description": "string", 
  "content": "string",
  "studycredit": "number",
  "location": "string",
  "contact_id": "ObjectId",
  "level": "string",
  "learningoutcomes": "string",
  "created_at": "Date",
  "updated_at": "Date"
}
```
### Schema Uitleg
```
- **Users**: Bevat gebruikersinformatie met een favorites array die verwijst naar modules
- **Modules**: Bevat module/cursus informatie met details over studiecredits en locatie
```

## API Endpoints

### Base API

```
GET /                                           - Welkomstbericht
GET /connection-test                            - Database connectie test
```

### Authentication API (Public)
### Users API

```
POST /api/auth/register                         - Nieuwe gebruiker registreren
POST /api/auth/login                            - Inloggen
POST /api/auth/logout                           - Uitloggen
```

### Users API (Protected - authentication required)
```
GET /api/users                                  - Alle gebruikers ophalen
GET /api/users/profile                          - Eigen profiel ophalen
GET /api/users/:id                              - Specifieke gebruiker ophalen op ID
GET /api/users/search/email?email=xxx           - Gebruiker ophalen op email
PUT /api/users/email                            - Email adres wijzigen
POST /api/users/favorites                       - Module toevoegen aan favorieten
DELETE /api/users/favorites/:moduleId           - Module verwijderen uit favorieten
```

### Modules API (Protected - authentication required)
### Modules API

```
GET /api/modules                                - Alle modules ophalen
GET /api/modules/:id                            - Specifieke module ophalen op ID
GET /api/modules/search/name?name=xxx           - Modules ophalen op naam
GET /api/modules/search/level?level=xxx         - Modules ophalen op level
GET /api/modules/search/location?location=xxx   - Modules ophalen op locatie
```

### Authentication
All endpoints marked as "Protected" require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Get the JWT token by logging in via `/api/auth/login`.

## Onion Architecture

Het project volgt de Onion Architecture principes:

### Lagen (van binnen naar buiten)
1. **Domain Layer** - Entities en Repository interfaces (pure business logic)
2. **Application Layer** - Services en Use Cases 
3. **Infrastructure Layer** - Database implementaties en externe dependencies
4. **Presentation Layer** - Controllers en DTOs

### Voordelen
- Dependency Rule: afhankelijkheden wijzen altijd naar binnen
- Database en UI zijn vervangbaar  
- Beter testbaar
- duidelijke scheiding van verantwoordelijkheden



# Testing

## Unit Tests

### Backend Unit Tests (NestJS)

De backend heeft **7 unit tests** die alle eisen uit de NOTES.md dekken:

#### AuthService Tests (4 tests):
1. `validateUser() - happy path` - Correcte credentials validatie
2. `validateUser() - unhappy path` - Verkeerde wachtwoord afhandeling  
3. `register() - happy path` - Nieuwe gebruiker registratie
4. `register() - unhappy path` - Duplicate email afhandeling

#### UserService Tests (3 tests):
5. `addToFavorites business logic - happy path` - Module toevoegen aan favorieten
6. `updateUser() - happy path` - Email update met validatie
7. `getUserById() - unhappy path` - User niet gevonden afhandeling

**Tests uitvoeren:**
```bash
cd server
npm test                   # Alle unit tests
npm run test:cov           # Unit tests met coverage report
npm run test:watch         # Watch mode voor development
```

### Frontend Unit Tests (Angular)

De frontend heeft **12 unit tests** voor AuthService en UserService:

#### AuthService Tests (8 tests):
- Login happy/unhappy path
- Register happy/unhappy path  
- Logout functionaliteit
- Token validatie
- Authentication status checks

#### UserService Tests (4 tests):
- Add/remove favorites happy/unhappy path
- Email update happy/unhappy path
- Profile ophalen en error handling

**Tests uitvoeren:**
```bash
cd client
npm test                    # Alle unit tests (interactief)
npm run test:coverage       # Tests met coverage report
```

## Integration Tests

### Backend Integration Tests

Er zijn **7 integration tests** die de complete API endpoints testen:

#### Auth Endpoints:
- POST /api/auth/register (happy + unhappy path)
- POST /api/auth/login (happy + unhappy paths voor verschillende scenario's)

**Tests uitvoeren:**
```bash
cd server
npm run test:e2e           # Integration tests
```

## UI Tests met Playwright

### End-to-End Tests

Er zijn **12 UI tests** die de complete user flows testen:

#### Authentication Tests (4 tests):
- Login flow (credentials naar modules)
- Invalid credentials error handling
- Logout flow
- Duplicate email prevention

#### Modules Tests (5 tests):
- Modules lijst weergave
- Search functionaliteit
- Module content weergave
- Navigatie vanaf modules page
- Authenticated access verificatie

#### Profile Tests (3 tests):
- Profile page toegang
- Authenticated pages toegang
- Navigatie tussen authenticated pages

**Tests uitvoeren:**
```bash
npm run test:e2e           # Alle UI tests (headless)
npm run test:e2e:ui        # UI tests met interactieve interface
npm run test:e2e:headed    # UI tests met browser interface
npm run test:e2e:report    # HTML test report bekijken
```

### Playwright Tests - Belangrijke Setup Informatie

#### BELANGRIJK: Start servers handmatig!

**Voor het draaien van Playwright tests moet je eerst de servers starten:**

```bash
# Optie 1: Gebruik de aangepaste scripts (aanbevolen)
npm run start:client:e2e    # Terminal 1: Client met alle interfaces
npm run start:server       # Terminal 2: Backend server

# Optie 2: Handmatig in de folders
cd client && npm run start:e2e    # Terminal 1: Client 
cd server && npm run start:dev    # Terminal 2: Server
```

**Wacht tot beide servers draaien:**
- Backend: `http://localhost:3000` 
- Frontend: `http://localhost:4200`

## Coverage Reports

### Backend Coverage
```bash
cd server
npm run test:cov
```
Dit genereert een coverage report in `server/coverage/`

### Frontend Coverage  
```bash
cd client
npm run test:coverage
```
Dit genereert een coverage report in `client/coverage/`

## Test Overzicht

| Test Type | Aantal | Locatie | Command |
|-----------|--------|---------|---------|
| Backend Unit Tests | 7 | `server/src/**/*.spec.ts` | `npm test` |
| Frontend Unit Tests | 12 | `client/src/**/*.spec.ts` | `npm test` |
| Backend Integration Tests | 7 | `server/test/*.spec.ts` | `npm run test:e2e` |
| UI Tests (Playwright) | 12 | `e2e/*.spec.ts` | `npm run test:e2e` |

## Test Requirements Coverage

**Unit Tests (minimaal 5)**: 7 backend + 12 frontend = **19 tests**

**Integration Tests (happy + unhappy path)**: 7 tests covering:
- User registration flow
- User login flow  
- Authentication error handling
- Duplicate email prevention

**UI Tests met Playwright**: 12 end-to-end tests covering:
- Complete user authentication flows (registratie + login)
- Module page access en navigation
- Profile en authenticated pages toegang
- Error handling voor invalid credentials

**Coverage Reports**: Backend, frontend en UI test coverage configuratie

## Belangrijke Test Scenarios

### Happy Path Tests:
- Nieuwe gebruiker kan registreren
- Gebruiker kan inloggen met correcte credentials
- Favorites kunnen worden toegevoegd/verwijderd
- Email kan worden geüpdatet
- Tokens worden correct gevalideerd

### Unhappy Path Tests:
- Registratie met bestaand email faalt
- Login met verkeerde credentials faalt
- Ongeldige tokens worden afgewezen
- Niet-bestaande users geven 404 errors
- Duplicate favorites worden afgehandeld

## Uitvoeren van Alle Tests

Voor een complete test run:

```bash
# Backend tests
cd server
npm run test:cov
npm run test:e2e

# Frontend tests  
cd client
npm run test:coverage

# UI Tests (Playwright)
npm run test:e2e           # Headless UI tests
npm run test:e2e:report    # HTML test report
```

Dit geeft je volledige coverage reports voor alle applicaties en test alle functionaliteit volgens de project eisen.


---
