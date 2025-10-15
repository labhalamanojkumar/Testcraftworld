import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'BlogStreamPro API',
    version: '1.0.0',
    description: 'API for BlogStreamPro - Modern Blogging Platform with AI Integration',
    contact: {
      name: 'BlogStreamPro Support',
      email: 'support@testcraft.world'
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://your-domain.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API Key for external AI tools and agents'
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      SessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid',
        description: 'Session cookie for authenticated users'
      }
    },
    schemas: {
      Article: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique article identifier' },
          title: { type: 'string', description: 'Article title' },
          content: { type: 'string', description: 'Article content (HTML)' },
          excerpt: { type: 'string', description: 'Article excerpt' },
          categoryId: { type: 'string', description: 'Category ID' },
          authorId: { type: 'string', description: 'Author ID' },
          slug: { type: 'string', description: 'URL slug' },
          metaTitle: { type: 'string', description: 'SEO meta title' },
          metaDescription: { type: 'string', description: 'SEO meta description' },
          tags: { type: 'string', description: 'Comma-separated tags' },
          published: { type: 'boolean', description: 'Publication status' },
          viewCount: { type: 'integer', description: 'View count' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique category identifier' },
          name: { type: 'string', description: 'Category name' },
          slug: { type: 'string', description: 'URL slug' },
          description: { type: 'string', description: 'Category description' },
          viewCount: { type: 'integer', description: 'View count' }
        }
      },
      AnalyticsData: {
        type: 'object',
        properties: {
          totalVisitors: { type: 'integer' },
          uniqueVisitors: { type: 'integer' },
          totalSessions: { type: 'integer' },
          totalPageViews: { type: 'integer' },
          avgSessionDuration: { type: 'number' },
          bounceRate: { type: 'number' },
          topPages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                title: { type: 'string' },
                views: { type: 'integer' }
              }
            }
          },
          trafficSources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source: { type: 'string' },
                sessions: { type: 'integer' },
                percentage: { type: 'number' }
              }
            }
          },
          deviceStats: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                device: { type: 'string' },
                visitors: { type: 'integer' },
                percentage: { type: 'number' }
              }
            }
          },
          realtimeData: {
            type: 'object',
            properties: {
              activeUsers: { type: 'integer' },
              todayViews: { type: 'integer' },
              todayVisitors: { type: 'integer' }
            }
          }
        }
      },
      ContentGenerationRequest: {
        type: 'object',
        required: ['topic', 'type'],
        properties: {
          topic: { type: 'string', description: 'Content topic or title' },
          type: {
            type: 'string',
            enum: ['article', 'summary', 'social-post', 'newsletter'],
            description: 'Type of content to generate'
          },
          categoryId: { type: 'string', description: 'Category ID for articles' },
          keywords: {
            type: 'array',
            items: { type: 'string' },
            description: 'SEO keywords'
          },
          tone: {
            type: 'string',
            enum: ['professional', 'casual', 'academic', 'conversational'],
            description: 'Content tone'
          },
          length: {
            type: 'string',
            enum: ['short', 'medium', 'long'],
            description: 'Content length'
          },
          targetAudience: { type: 'string', description: 'Target audience description' }
        }
      },
      ApiKey: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'API Key ID' },
          name: { type: 'string', description: 'API Key name' },
          key: { type: 'string', description: 'The actual API key (masked in responses)' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Permissions granted to this key'
          },
          createdAt: { type: 'string', format: 'date-time' },
          lastUsed: { type: 'string', format: 'date-time' },
          isActive: { type: 'boolean', description: 'Whether the key is active' }
        }
      }
    }
  },
  security: [
    { ApiKeyAuth: [] },
    { BearerAuth: [] },
    { SessionAuth: [] }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./server/routes.ts', './server/ai-routes.ts'], // Paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJSDoc(options);
export const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
  },
};