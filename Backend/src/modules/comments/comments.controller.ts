import { Request,Response,NextFunction } from "express";
import { CommentsService } from "./comments.service";
import { ApiResponse } from "../../types/responses";
import { AppError } from "../../middlewares/error.middleware";

export class CommentsController
{

    private commentsService: CommentsService;

    constructor()
    {

        this.commentsService=new CommentsService();

    }
    /**
    * POST /api/comments/:postId
    * Crear un comentario en un post
    */
    createComment=async(_req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(_req as any).user

            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            const{postId}=_req.params
            const{contenido}=_req.body
            const comment=await this.commentsService.createComment(user.id,postId,contenido);
            const response:ApiResponse=
            {

                success:true,
                message:'Comentario creado exitosamente',
                data:comment,
                timestamp:new Date().toISOString(),

            }
            res.status(201).json(response)

        }catch(error){

            next(error)

        }

    }
    /**
    * GET /api/comments/:postId
    * Listar comentarios de un post
    */
    getPostComments=async(_req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const{postId}=_req.params
            const page=parseInt(_req.query.page as string)||1;
            const limit=parseInt(_req.query.limit as string)||20;
            const result=await this.commentsService.getPostComments(postId,page,limit)
            const response:ApiResponse=
            {

                success:true,
                message:'Comentarios obtenidos exitosamente',
                data:result.comments,
                timestamp:new Date().toISOString(),

            };
            (response as any).pagination=result.pagination
            res.status(200).json(response)
            

        }catch(error){

            next(error)

        }

    }
    /**
    * DELETE /api/comments/:commentId
    * Eliminar un comentario
    */
    deleteComment=async(_req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(_req as any).user
            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            const{commentId}=_req.params
            await this.commentsService.deleteComment(commentId,user.id)
            const response:ApiResponse=
            {

                success:true,
                message:'Comentario eliminado exitosamente',
                timestamp:new Date().toISOString(),

            }
            res.status(200).json(response)

        }catch(error){

            next(error)

        }

    }


}