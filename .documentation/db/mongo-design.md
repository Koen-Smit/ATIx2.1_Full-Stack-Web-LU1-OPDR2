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
- **Users**: Bevat gebruikersinformatie met een favorites array die verwijst naar modules
- **Modules**: Bevat module/cursus informatie met details over studiecredits en locatie
- **Relaties**: Users kunnen modules toevoegen aan favorites via module_id referentie
