import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../types/responses';
import { CreateUser, Login } from '../../types/model';
import { AppError } from '../../middlewares/error.middleware';

export class AuthController 
{

  private authService:AuthService;

  constructor() 
  {

    this.authService=new AuthService();

  }

  register=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
  {

    try 
    {
      const userData:CreateUser=req.body;
      const result=await this.authService.registrar(userData);

      const response:ApiResponse= 
      {

        success:true,
        message:'Usuario registrado exitosamente',
        data:result,
        timestamp:new Date().toISOString(),

      };

      res.status(201).json(response);

    }catch(error){

      next(error);

    }
  };

  login=async(req:Request,res:Response,next:NextFunction):Promise<void>=> 
  {
    try 
    {

      const credentials:Login=req.body;
      const result=await this.authService.login(credentials);

      const response:ApiResponse= 
      {
        success:true,
        message:'Inicio de sesión exitoso',
        data:result,
        timestamp:new Date().toISOString(),
      };
      res.status(200).json(response);
    }catch(error){

      next(error);

    }
  };

  getMe=async(req:Request,res:Response,next:NextFunction):Promise<void>=> 
  {
    
    try 
    {

      const user=(req as any).user;

      if(!user) 
      {

        throw new AppError(401,'Usuario no autenticado');

      }

      const profile=await this.authService.getProfile(user.id);

      const response:ApiResponse= 
      {
        success:true,
        message:'Perfil obtenido exitosamente',
        data:profile,
        timestamp:new Date().toISOString(),

      };

      res.status(200).json(response);
    }catch(error){

      next(error);

    }
  };
}