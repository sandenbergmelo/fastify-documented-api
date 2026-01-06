import cors from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import scalarAPIReference from '@scalar/fastify-api-reference'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { db } from './database/client.ts'
import { env } from './env.ts'
import { login } from './routes/auth/login.ts'
import { root } from './routes/root.ts'
import { createUser } from './routes/users/create-user.ts'
import { deleteUser } from './routes/users/delete-user.ts'
import { getUsers } from './routes/users/get-users.ts'
import { profile } from './routes/users/profile.ts'
import { updateUserRole } from './routes/users/update-user-role.ts'
import { updateUser } from './routes/users/update-user.ts'

const isTest = env.NODE_ENV === 'test'

const app = fastify({
  logger: isTest
    ? false
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            singleLine: true,
            colorize: env.NODE_ENV !== 'production',
          },
        },
      },
}).withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(cors, {
  origin: /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Fastify documented API',
      description: 'Documentation API Fastify with Zod and Swagger',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(scalarAPIReference, {
  routePrefix: '/docs',
  configuration: {
    title: 'Fastify documented API',
    theme: 'elysiajs',
  },
})

app.addHook('onReady', async () => {
  try {
    await db.$client.connect()
    app.log.info('Database connected successfully')
  } catch (error) {
    app.log.error('Error connecting to the database')
    app.log.error(error)
    process.exit(1)
  }
})

app.addHook('onResponse', (req, reply, done) => {
  app.log.info(`${req.ip} - "${req.method} ${req.url}" ${reply.statusCode}`)
  done()
})

app.register(root)
app.register(login)
app.register(createUser)
app.register(getUsers)
app.register(profile)
app.register(updateUserRole)
app.register(updateUser)
app.register(deleteUser)

export { app as server }
