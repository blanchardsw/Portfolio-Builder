// import swaggerJsdoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio Builder API',
      version: '1.0.0',
      description: 'A comprehensive API for portfolio generation and resume processing',
      contact: {
        name: 'Stephen Blanchard',
        email: 'stephen.blanchard@example.com',
        url: 'https://github.com/blanchardsw/portfolio-builder',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://portfolio-builder-production-3a0c.up.railway.app'
          : 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      schemas: {
        Portfolio: {
          type: 'object',
          properties: {
            personalInfo: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Stephen Blanchard' },
                title: { type: 'string', example: 'Full Stack Developer' },
                email: { type: 'string', format: 'email', example: 'stephen@example.com' },
                phone: { type: 'string', example: '+1 (555) 123-4567' },
                location: { type: 'string', example: 'San Francisco, CA' },
                summary: { type: 'string', example: 'Experienced developer with expertise in...' },
              },
            },
            experience: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company: { type: 'string', example: 'Tech Corp' },
                  position: { type: 'string', example: 'Senior Developer' },
                  startDate: { type: 'string', format: 'date', example: '2020-01-01' },
                  endDate: { type: 'string', format: 'date', example: '2023-12-31' },
                  description: { type: 'string', example: 'Led development of...' },
                  technologies: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['React', 'Node.js', 'TypeScript'],
                  },
                },
              },
            },
            education: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  institution: { type: 'string', example: 'University of Technology' },
                  degree: { type: 'string', example: 'Bachelor of Science in Computer Science' },
                  graduationDate: { type: 'string', format: 'date', example: '2019-05-15' },
                  gpa: { type: 'number', example: 3.8 },
                },
              },
            },
            skills: {
              type: 'array',
              items: { type: 'string' },
              example: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'],
            },
            projects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Portfolio Builder' },
                  description: { type: 'string', example: 'Full-stack portfolio generation platform' },
                  technologies: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['React', 'Node.js', 'TypeScript'],
                  },
                  url: { type: 'string', format: 'uri', example: 'https://github.com/user/project' },
                },
              },
            },
          },
        },
        UploadResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            filename: { type: 'string', example: 'resume_20240131_123456.pdf' },
            originalName: { type: 'string', example: 'Stephen_Blanchard_Resume.pdf' },
            size: { type: 'number', example: 108746 },
            mimeType: { type: 'string', example: 'application/pdf' },
            analysis: {
              type: 'object',
              properties: {
                extractedText: { type: 'string', example: 'Stephen Blanchard\\nFull Stack Developer...' },
                wordCount: { type: 'number', example: 450 },
                detectedSections: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['personal_info', 'experience', 'education', 'skills'],
                },
              },
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'healthy' },
            timestamp: { type: 'string', format: 'date-time', example: '2024-01-31T12:00:00Z' },
            version: { type: 'string', example: '1.0.0' },
            uptime: { type: 'number', example: 3600 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'File upload failed' },
            message: { type: 'string', example: 'Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.' },
            code: { type: 'string', example: 'INVALID_FILE_TYPE' },
            timestamp: { type: 'string', format: 'date-time', example: '2024-01-31T12:00:00Z' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

// const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
  // Swagger temporarily disabled - install swagger-jsdoc and swagger-ui-express to enable
  console.log('Swagger documentation disabled - install dependencies to enable');
  // app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  //   explorer: true,
  //   customCss: '.swagger-ui .topbar { display: none }',
  //   customSiteTitle: 'Portfolio Builder API Documentation',
  // }));

  // Serve raw OpenAPI spec
  app.get('/api/docs.json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send({ message: 'Swagger documentation disabled - install dependencies to enable' });
  });
};

// export default specs;
