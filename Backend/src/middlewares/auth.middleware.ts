/**
 * 
 *  Validador de token JWT

    Validacion de permisos

    Validacion de datos (DTO)

    Rate limiting

    Cors
 * 
 */

import { Request, Response, NextFunction } from 'express';
import { VerificarToken } from '../utils/jwt';
import { AppError } from './error.middleware';

export const authenticate=(req:Request,_res:Response,next:NextFunction):void=> 
{

   try 
   {
        const authHeader=req.headers.authorization;

        if(!authHeader||!authHeader.startsWith('Bearer ')) 
        {

          throw new AppError(401,'Token no proporcionado o formato invalido');

        }

        const token=authHeader.split(' ')[1];
        const descifrado=VerificarToken(token);

        //usar casting para asignar user
        (req as any).user=
        {
            id:descifrado.id,
            email:descifrado.email,
            username:descifrado.username,
            is_active:true,
        };

        next();
    }catch(error){
        if(error instanceof AppError) 
        {
            next(error);
        }else{

            next(new AppError(401,'Token invalido o expirado'));

        }
    }

};

export const Autorizacion = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const descifrado = VerificarToken(token);

      (req as any).user = {
        id: descifrado.id,
        email: descifrado.email,
        username: descifrado.username,
        is_active: true,
      };
    }

    next();
  } catch (error) {
    next();
  }
};