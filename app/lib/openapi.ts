export function buildOpenApiSpec(baseUrl = "http://localhost:3000") {
  return {
    openapi: "3.0.3",
    info: {
      title: "Reservation API",
      version: "1.0.0",
      description: "API REST pour réservation de tables (restaurants, tables, réservations, disponibilité, auth).",
    },
    servers: [{ url: baseUrl }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/api/auth/register": {
        post: {
          security: [],
          summary: "Créer un compte client",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8 },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Utilisateur créé" },
            "400": { description: "Validation error" },
            "409": { description: "Email déjà utilisé" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          security: [],
          summary: "Se connecter",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "OK" },
            "401": { description: "Invalid credentials" },
          },
        },
      },
      "/api/restaurants": {
        get: {
          summary: "Lister les restaurants (pagination + filtre capacité + recherche)",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
            { name: "q", in: "query", schema: { type: "string" } },
            { name: "capacity", in: "query", schema: { type: "integer", minimum: 1 } },
          ],
          responses: { "200": { description: "OK" } },
        },
        post: {
          summary: "Créer un restaurant (ADMIN)",
          responses: { "201": { description: "Created" }, "403": { description: "Forbidden" } },
        },
      },
      "/api/restaurants/{id}": {
        get: {
          summary: "Détails d'un restaurant",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
        },
        put: {
          summary: "Modifier un restaurant (ADMIN)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "OK" }, "403": { description: "Forbidden" } },
        },
        delete: {
          summary: "Supprimer un restaurant (ADMIN)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "OK" }, "403": { description: "Forbidden" } },
        },
      },
      "/api/restaurants/{id}/tables": {
        get: {
          summary: "Lister les tables d'un restaurant",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
        },
      },
      "/api/tables": {
        post: { summary: "Créer une table (ADMIN)", responses: { "201": { description: "Created" } } },
      },
      "/api/tables/{id}": {
        put: {
          summary: "Modifier une table (ADMIN)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "OK" } },
        },
        delete: {
          summary: "Supprimer une table (ADMIN)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/availability": {
        get: {
          summary: "Vérifier disponibilité (par tableId ou restaurantId+capacity)",
          parameters: [
            { name: "tableId", in: "query", schema: { type: "string" } },
            { name: "restaurantId", in: "query", schema: { type: "string" } },
            { name: "capacity", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "startAt", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "endAt", in: "query", schema: { type: "string", format: "date-time" } },
            { name: "date", in: "query", schema: { type: "string", format: "date" } },
            { name: "time", in: "query", schema: { type: "string", example: "19:30" } },
            { name: "durationMinutes", in: "query", schema: { type: "integer", default: 120 } },
          ],
          responses: { "200": { description: "OK" }, "400": { description: "Bad request" } },
        },
      },
      "/api/reservations": {
        get: {
          summary: "Lister réservations (client: ses réservations, admin: toutes, pagination + filtres)",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
            { name: "userId", in: "query", schema: { type: "string" } },
            { name: "restaurantId", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string", enum: ["CONFIRMED", "CANCELLED"] } },
          ],
          responses: { "200": { description: "OK" } },
        },
        post: { summary: "Créer une réservation", responses: { "201": { description: "Created" } } },
      },
      "/api/reservations/{id}": {
        get: {
          summary: "Détails réservation",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "OK" }, "404": { description: "Not found" } },
        },
        put: {
          summary: "Modifier réservation / annuler (status=CANCELLED)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "OK" } },
        },
        delete: {
          summary: "Annuler réservation (soft cancel)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/reservations/{id}/history": {
        get: {
          summary: "Historique d'une réservation",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "OK" } },
        },
      },
    },
  }
}

