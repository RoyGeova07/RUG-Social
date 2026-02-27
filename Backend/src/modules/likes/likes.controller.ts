import { Request,Response,NextFunction } from "express";
import { LikesService } from "./likes.service";
import { ApiResponse } from "../../types/responses";
import { AppError } from "../../middlewares/error.middleware";

export class LikesController
{

    private likesService:LikesService;

    constructor()
    {

        this.likesService=new LikesService();

    }
    /**
    * POST /api/likes/:postId
    * Dar like a un post
    */
    likePost=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=req.user;

            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            const {postId}=req.params;

            await this.likesService.likePost(user.id,postId);

            const response:ApiResponse=
            {

                success:true,
                message:'Like agregado exitosamente',
                timestamp:new Date().toISOString(),

            };
            res.status(200).json(response);

        }catch(error){

            next(error)

        }

    };
    /**
    * DELETE /api/likes/:postId
    * Quitar like de un post
    */
    unlikePost=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=req.user;

            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            const{postId}=req.params;

            await this.likesService.unlikePost(user.id,postId);

            const response:ApiResponse=
            {

                success:true,
                message:'Like eliminado exitosamente',
                timestamp:new Date().toISOString(),

            }
            res.status(200).json(response);

        }catch(error){

            next(error)

        }

    }
    /**
    * GET /api/likes/:postId
    * Obtener lista de usuarios que dieron like
    */
    getPostLikes=async(_req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const{postId}=_req.params;
            const page=parseInt(_req.query.page as string)||1;
            const limit=parseInt(_req.query.limit as string)||20;
            const result=await this.likesService.getPostLike(postId,page,limit)

            const response:ApiResponse=
            {

                success:true,
                message:'Likes obtenidos exitosamente',
                data:{likes:result.likes,pagination:result.pagination},
                timestamp:new Date().toISOString(),

            };
            res.status(200).json(response)

        }catch(error){

            next(error)

        }

    }
    /**
    * GET /api/likes/:postId/check
    * Verificar si el usuario autenticado dio like
    */
    checkUserLike=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=req.user;
            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            const{postId}=req.params;
            const hasLiked=await this.likesService.checkUserLike(user.id,postId);
            const response:ApiResponse=
            {

                success:true,
                message:'Verificacion completada',
                data:{postId,userId:user.id,hasLiked},
                timestamp:new Date().toISOString(),

            };
            res.status(200).json(response);
            

        }catch(error){

            next(error)

        }

    }

}
