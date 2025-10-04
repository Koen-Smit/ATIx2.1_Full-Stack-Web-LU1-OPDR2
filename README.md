# ATIx2.1 Full-Stack Web Project
Een full-stack webapplicatie met Angular frontend en NestJS backend.

## Project Structuur
```
client/     - Angular frontend applicatie
server/     - NestJS backend API
```
## Ports
- Client (Angular): http://localhost:4200
- Server (NestJS): http://localhost:3000

---

## Installatie
### Alle dependencies installeren
```bash
npm install
npm run install:all             # Installeer alles

npm install --workspace=client  # Installeer alleen client dependencies
npm install --workspace=server  # Installeer alleen server dependencies
```

---

## Development Commands
### Beide projecten starten
```bash
npm start               # Start beide projecten, start zowel de Angular client als de NestJS server development mode
npm run start:client    # Start alleen Angular client
npm run start:server    # Start alleen NestJS server

npm run build           # Build beide projecten
npm run build:client    # Build alleen client
npm run build:server    # Build alleen server

npm run test            # Run tests voor beide projecten
npm run test:client     # Run alleen client tests
npm run test:server     # Run alleen server tests
```

## Package toevoegen
```bash
npm install package-name --workspace=client     # Voor client
npm install package-name --workspace=server     # Voor server
npm install package-name --save-dev             # Voor root
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
- **Relaties**: Users kunnen modules toevoegen aan favorites via module_id referentie
```

## API Endpoints

### Base API

```
GET /                                           - 
GET /connection-test                            - Database connectie test
```

### Users API

```
GET /api/users                                  - Alle gebruikers ophalen
GET /api/users/:id                              - Specifieke gebruiker ophalen op ID
GET /api/users/search/email?email=xxx           - Gebruiker ophalen op email
```

### Modules API

```
GET /api/modules                                - Alle modules ophalen
GET /api/modules/:id                            - Specifieke module ophalen op ID
GET /api/modules/search/level?level=xxx         - Modules ophalen op level
GET /api/modules/search/location?location=xxx   - Modules ophalen op locatie
```

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
