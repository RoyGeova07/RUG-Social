import { Request,Response,NextFunction } from "express";
import { UsersService } from "./users.service";
import { ApiResponse } from "../../types/responses";
import { AppError } from "../../middlewares/error.middleware";

export class UsersControllers
{

    private usersService:UsersService

    constructor()
    {

        this.usersService=new UsersService();

    }
    /**
     *  GET /api/users/:username
     *  Obtener perfil de usuario por username
    */
    getUsersByUsername=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const{username}=req.params

            const user=await this.usersService.getUserbyUsername(username);

            const response:ApiResponse=
            {

                success:true,
                message:'Usuario obtenido exitosamente',
                data:user,
                timestamp:new Date().toISOString(),

            };
            res.status(200).json(response);

        }catch(error){

            next(error)

        }

    }
    /**
     * GET /api/users
     * Listar usuarios con paginacion
    */
    listUsers=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const page=parseInt(req.query.page as string)||1;
            const limit=parseInt(req.query.limit as string)||10;

            const resultado=await this.usersService.listUsers(page,limit)

            const response:ApiResponse=
            {

                success:true,
                message:'Usuarios obtenidos exitosamente',
                data:{users:resultado.users,pagination:resultado.pagination},
                timestamp:new Date().toISOString(),

            };
            res.status(200).json(response)

        }catch(error){

            next(error)

        }

    }
   /**
   * PUT /api/users/profile
   * Actualizar perfil del usuario autenticado
   */
   updateProfile=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
   {

        try
        {

            const user=req.user;

            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            const updateProfile=await this.usersService.updateProfile(user.id,req.body);
            const response:ApiResponse=
            {

                success:true,
                message:'Perfil actualizado exitosamente',
                data:updateProfile,
                timestamp: new Date().toISOString(),

            }
            res.status(200).json(response)

        }catch(error){

            next(error)

        }

    }
    /**
   * POST /api/users/follow/:userId
   * Seguir a un usuario
   */
    followUser=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=req.user;

            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }

            const{userId}=req.params;

            await this.usersService.followUser(user.id,userId)
            const Response:ApiResponse=
            {

                success:true,
                message:'Ahora sigues a este usuario',
                timestamp:new Date().toISOString(),

            }
            res.status(200).json(Response)

        }catch(error){

            next(error)

        }

    }
    /**
   * DELETE /api/users/follow/:userId
   * Dejar de seguir a un usuario
   */
    unfollowUser=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=req.user;
            const{userId}=req.params;

            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            await this.usersService.unfollowUser(user.id,userId)

            const response:ApiResponse=
            {

                success:true,
                message:'Dejaste de seguir a este usuario',
                timestamp: new Date().toISOString(),

            }
            res.status(200).json(response)

        }catch(error){

            next(error)

        }

    }
    /**
   * GET /api/users/:userId/followers
   * Obtener seguidores de un usuario
   */
    getFollowers=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const{userId}=req.params
            const page=parseInt(req.query.page as string)||1;
            const limit=parseInt(req.query.limit as string)||20;

            const resultado=await this.usersService.getFollowers(userId,page,limit)

            const response:ApiResponse=
            {

                success:true,
                message:'Seguidores obtenidos exitosamente',
                data:{followers:resultado.followers,pagination:resultado.pagination},
                timestamp:new Date().toISOString(),

            };
            (response as any).pagination=resultado.pagination
            res.status(200).json(response)
            

        }catch(error){

            next(error)

        }

    };
    /**
   * GET /api/users/:userId/following
   * Obtener usuarios que sigue
   */
    getFollowing=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const{userId}=req.params
            const page=parseInt(req.query.page as string)||1;
            const limit=parseInt(req.query.limit as string)||20;

            const result=await this.usersService.getFollowing(userId,page,limit)

            const response:ApiResponse=
            {

                success: true,
                message: 'Seguidos obtenidos exitosamente',
                data:{following:result.following,pagination:result.pagination},
                timestamp: new Date().toISOString(),

            };
            (response as any).pagination=result.pagination
            res.status(200).json(response)

        }catch(error){

            next(error)

        }

    }



}