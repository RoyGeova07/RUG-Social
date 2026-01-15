/**
 * 
 * Hash de contraseñas (bcrypt)

  Generacion de tokens

  Subida de imagenes

  Formateo de fechas

  Validaciones
 * 
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ManejarErrorres, notFound } from './middlewares/error.middleware';
import { logger } from './middlewares/logger.middleware';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes'
import postsRoutes from './modules/posts/posts.routes'
import likesRoutes from './modules/likes/likes.routes'
import commentsRoutes from './modules/comments/comments.routes'
import storiesRoutes from './modules/stories/stories.routes'

dotenv.config();

const app: Application = express();

app.use
(

  cors
  ({

    origin: process.env.ALLOWED_ORIGINS?.split(',')||'*',
    credentials: true,

  })

);

app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:true,limit: '10mb'}));

if(process.env.NODE_ENV==='development') 
{

  app.use(logger);

}

app.get('/api/health',(_req:Request,res:Response)=> 
{

  res.json
  ({

    success:true,
    message:'Servidor funcionando correctamente',
    environment: process.env.NODE_ENV,
    timestamp:new Date().toISOString(),

  });

});

app.get('/',(_req: Request,res:Response)=> 
{
  res.json
  ({

    success:true,
    message:'API Red Social - Backend',
    version:'1.0.0',
    endpoints: 
    {

      health:'/api/health',
      auth:'/api/auth',
      users:'/api/users',
      posts:'/api/posts',
      likes:'/api/likes',
      comments:'/api/comments',
      stories:'/api/stories',

    },

  });

});

app.use('/api/auth',authRoutes);
app.use('/api/users',usersRoutes);
app.use('/api/posts',postsRoutes);
app.use('/api/likes',likesRoutes);
app.use('/api/comments',commentsRoutes);
app.use('/api/stories',storiesRoutes);

app.use(notFound);
app.use(ManejarErrorres);

export default app;