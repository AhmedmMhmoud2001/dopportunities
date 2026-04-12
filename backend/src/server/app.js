import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import router from './routes/index.js';

const app = express();

app.use(
  helmet({
    // Allow images/uploads to load in <img> from another origin (e.g. Vite :5173 → API :5000)
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

const swaggerSpec = swaggerJSDoc({
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Dopportunities API',
			version: '1.0.0',
			description: 'REST API documentation'
		},
		servers: [
			{ url: `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}` }
		],
		tags: [
			{ name: 'Health' },
			{ name: 'Auth' },
			{ name: 'Users' },
			{ name: 'Pages' },
			{ name: 'FAQs' },
			{ name: 'Services' }
		],
		components: {
			securitySchemes: {
				BearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT'
				}
			},
			schemas: {
				Blog: {
					type: 'object',
					properties: {
						id: { type: 'integer' },
						title: { type: 'string' },
						author: { type: 'string', nullable: true },
						publishedAt: { type: 'string', format: 'date-time', nullable: true },
						content: { type: 'string' },
						slug: { type: 'string' }
					}
				},
				BlogCreate: {
					type: 'object',
					required: ['title', 'content', 'slug'],
					properties: {
						title: { type: 'string' },
						author: { type: 'string' },
						publishedAt: { type: 'string', format: 'date-time' },
						content: { type: 'string' },
						slug: { type: 'string' }
					}
				},
				User: {
					type: 'object',
					properties: {
						id: { type: 'integer' },
						email: { type: 'string' },
						name: { type: 'string', nullable: true },
						role: { type: 'string', enum: ['user', 'admin'] }
					}
				},
				UserCreate: {
					type: 'object',
					required: ['email', 'password'],
					properties: {
						email: { type: 'string' },
						password: { type: 'string' },
						name: { type: 'string' },
						role: { type: 'string' }
					}
				},
				AuthResponse: {
					type: 'object',
					properties: {
						token: { type: 'string' },
						user: { $ref: '#/components/schemas/User' }
					}
				},
				Page: {
					type: 'object',
					properties: {
						id: { type: 'integer' },
						slug: { type: 'string' },
						title: { type: 'string' },
						content: { type: 'string' }
					}
				},
				PageCreate: {
					type: 'object',
					required: ['slug', 'title'],
					properties: {
						slug: { type: 'string' },
						title: { type: 'string' },
						content: { type: 'string' }
					}
				},
				Faq: {
					type: 'object',
					properties: {
						id: { type: 'integer' },
						question: { type: 'string' },
						answer: { type: 'string' },
						sortOrder: { type: 'integer' },
						isActive: { type: 'boolean' }
					}
				},
				FaqCreate: {
					type: 'object',
					required: ['question', 'answer'],
					properties: {
						question: { type: 'string' },
						answer: { type: 'string' },
						sortOrder: { type: 'integer' },
						isActive: { type: 'boolean' }
					}
				},
				Service: {
					type: 'object',
					properties: {
						id: { type: 'integer' },
						title: { type: 'string' },
						slug: { type: 'string' },
						description: { type: 'string' },
						imageUrl: { type: 'string', nullable: true },
						sortOrder: { type: 'integer' },
						isActive: { type: 'boolean' }
					}
				},
				ServiceCreate: {
					type: 'object',
					required: ['title', 'slug', 'description'],
					properties: {
						title: { type: 'string' },
						slug: { type: 'string' },
						description: { type: 'string' },
						imageUrl: { type: 'string' },
						sortOrder: { type: 'integer' },
						isActive: { type: 'boolean' }
					}
				}
			}
		},
		paths: {
			'/api/v1/health': {
				get: {
					tags: ['Health'],
					summary: 'API health check',
					responses: {
						'200': { description: 'OK' }
					}
				}
			},
			'/api/v1/auth/signup': {
				post: {
					tags: ['Auth'],
					summary: 'Sign up',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/UserCreate' }
							}
						}
					},
					responses: {
						'201': {
							description: 'Created',
							content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
						},
						'409': { description: 'Email already in use' }
					}
				}
			},
			'/api/v1/auth/signin': {
				post: {
					tags: ['Auth'],
					summary: 'Sign in',
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: {
									type: 'object',
									required: ['email', 'password'],
									properties: { email: { type: 'string' }, password: { type: 'string' } }
								}
							}
						}
					},
					responses: {
						'200': {
							description: 'OK',
							content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
						},
						'401': { description: 'Invalid credentials' }
					}
				}
			},
			'/api/v1/users': {
				get: {
					tags: ['Users'],
					summary: 'List users (admin)',
					security: [{ BearerAuth: [] }],
					responses: {
						'200': {
							description: 'OK',
							content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } }
						}
					}
				},
				post: {
					tags: ['Users'],
					summary: 'Create user (admin)',
					security: [{ BearerAuth: [] }],
					requestBody: {
						required: true,
						content: { 'application/json': { schema: { $ref: '#/components/schemas/UserCreate' } } }
					},
					responses: { '201': { description: 'Created' } }
				}
			},
			'/api/v1/users/{id}': {
				get: {
					tags: ['Users'],
					summary: 'Get user by id (admin)',
					security: [{ BearerAuth: [] }],
					parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
					responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } }
				},
				put: {
					tags: ['Users'],
					summary: 'Update user (admin)',
					security: [{ BearerAuth: [] }],
					parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
					requestBody: {
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: { email: { type: 'string' }, password: { type: 'string' }, name: { type: 'string' }, role: { type: 'string' } }
								}
							}
						}
					},
					responses: { '200': { description: 'OK' } }
				},
				delete: {
					tags: ['Users'],
					summary: 'Delete user (admin)',
					security: [{ BearerAuth: [] }],
					parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
					responses: { '204': { description: 'No Content' } }
				}
			},
			'/api/v1/pages': {
				get: {
					tags: ['Pages'],
					summary: 'List pages',
					responses: {
						'200': {
							description: 'OK',
							content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Page' } } } }
						}
					}
				},
				post: {
					tags: ['Pages'],
					summary: 'Create page (admin)',
					security: [{ BearerAuth: [] }],
					requestBody: {
						required: true,
						content: { 'application/json': { schema: { $ref: '#/components/schemas/PageCreate' } } }
					},
					responses: { '201': { description: 'Created' } }
				}
			},
			'/api/v1/pages/{idOrSlug}': {
				get: {
					tags: ['Pages'],
					summary: 'Get page by id or slug',
					parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } }],
					responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } }
				},
				put: {
					tags: ['Pages'],
					summary: 'Update page (admin)',
					security: [{ BearerAuth: [] }],
					parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } }],
					requestBody: {
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/PageCreate' }
							}
						}
					},
					responses: { '200': { description: 'OK' } }
				},
				delete: {
					tags: ['Pages'],
					summary: 'Delete page (admin)',
					security: [{ BearerAuth: [] }],
					parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } }],
					responses: { '204': { description: 'No Content' } }
				}
			},
			'/api/v1/blogs': {
				get: {
					tags: ['Blogs'],
					summary: 'List blog posts',
					parameters: [
						{ name: 'limit', in: 'query', schema: { type: 'integer' } },
						{ name: 'offset', in: 'query', schema: { type: 'integer' } }
					],
					responses: { '200': { description: 'OK' } }
				},
				post: {
					tags: ['Blogs'],
					summary: 'Create blog post (admin)',
					security: [{ BearerAuth: [] }],
					requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogCreate' } } } },
					responses: { '201': { description: 'Created' } }
				}
			},
			'/api/v1/blogs/{idOrSlug}': {
				get: {
					tags: ['Blogs'],
					summary: 'Get blog by id or slug',
					parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } }],
					responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } }
				},
				put: {
					tags: ['Blogs'],
					summary: 'Update blog (admin)',
					security: [{ BearerAuth: [] }],
					parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } }],
					requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogCreate' } } } },
					responses: { '200': { description: 'OK' } }
				},
				delete: {
					tags: ['Blogs'],
					summary: 'Delete blog (admin)',
					security: [{ BearerAuth: [] }],
					parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } }],
					responses: { '204': { description: 'No Content' } }
				}
			},
			'/api/v1/faqs': {
				get: {
					tags: ['FAQs'],
					summary: 'List FAQs',
					responses: {
						'200': {
							description: 'OK',
							content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Faq' } } } }
						}
					}
				},
				post: {
					tags: ['FAQs'],
					summary: 'Create FAQ (admin)',
					security: [{ BearerAuth: [] }],
					requestBody: {
						required: true,
						content: { 'application/json': { schema: { $ref: '#/components/schemas/FaqCreate' } } }
					},
					responses: { '201': { description: 'Created' } }
				}
			},
			'/api/v1/faqs/{id}': {
				get: {
					tags: ['FAQs'],
					summary: 'Get FAQ by id',
					parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
					responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } }
				},
				put: {
					tags: ['FAQs'],
					summary: 'Update FAQ (admin)',
					security: [{ BearerAuth: [] }],
					parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
					requestBody: {
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/FaqCreate' }
							}
						}
					},
					responses: { '200': { description: 'OK' } }
				},
				delete: {
					tags: ['FAQs'],
					summary: 'Delete FAQ (admin)',
					security: [{ BearerAuth: [] }],
					parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
					responses: { '204': { description: 'No Content' } }
				}
			},
			'/api/v1/services': {
				get: {
					tags: ['Services'],
					summary: 'List services',
					responses: {
						'200': {
							description: 'OK',
							content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Service' } } } }
						}
					}
				},
				post: {
					tags: ['Services'],
					summary: 'Create service (admin)',
					security: [{ BearerAuth: [] }],
					requestBody: {
						required: true,
						content: { 'application/json': { schema: { $ref: '#/components/schemas/ServiceCreate' } } }
					},
					responses: { '201': { description: 'Created' } }
				}
			},
			'/api/v1/services/{idOrSlug}': {
				get: {
					tags: ['Services'],
					summary: 'Get service by id or slug',
					parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } }],
					responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } }
				},
				put: {
					tags: ['Services'],
					summary: 'Update service (admin)',
					security: [{ BearerAuth: [] }],
					parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } }],
					requestBody: {
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/ServiceCreate' }
							}
						}
					},
					responses: { '200': { description: 'OK' } }
				},
				delete: {
					tags: ['Services'],
					summary: 'Delete service (admin)',
					security: [{ BearerAuth: [] }],
					parameters: [{ name: 'idOrSlug', in: 'path', required: true, schema: { type: 'string' } }],
					responses: { '204': { description: 'No Content' } }
				}
			}
		}
	},
	apis: []
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', router);

app.get('/', (_req, res) => {
	res.status(200).json({ message: 'Dopportunities API', status: 'ok' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
