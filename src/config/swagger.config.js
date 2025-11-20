import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quizard API",
      version: "1.0.0",
      description:
        "API documentation for Quizard - A comprehensive learning management system with groups, modules, materials, quizzes, and subscription management",
      contact: {
        name: "Quizard Team",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://quizard-backend-534916389595.europe-west1.run.app",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Unauthorized" },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Resource not found" },
                },
              },
            },
          },
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Validation failed" },
                  errors: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        ServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Internal server error" },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Users",
        description: "User authentication and profile management",
      },
      {
        name: "Groups",
        description: "Group management and membership",
      },
      {
        name: "Modules",
        description: "Module management within groups",
      },
      {
        name: "Materials",
        description: "Learning materials (PDFs, videos, links)",
      },
      {
        name: "Plans",
        description: "Subscription plans management",
      },
      {
        name: "Subscriptions",
        description: "User subscriptions and billing",
      },
      {
        name: "Analytics",
        description: "Platform analytics and statistics (Admin only)",
      },
    ],
  },
  apis: [
    "./src/modules/**/*.route.js",
    "./src/modules/**/*.router.js",
    "./src/models/*.model.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
