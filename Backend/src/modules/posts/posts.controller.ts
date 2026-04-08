import { Request,Response,NextFunction, } from "express";
import { PostsService } from "./posts.service";
import { ApiResponse } from "../../types/responses";
import { AppError } from "../../middlewares/error.middleware";

//AUN FALTA CORRECCIONES AL ELIMINAR EL POST CON MEDIA, DEBERIA ELIMINAR PRIMERO LA MEDIA Y LUEGO EL POST, O EN CASO DE QUE SE ELIMINE EL POST SE DEBE ELIMINAR EN CASCADA LA MEDIA
export class PostsController
{

    private postsService:PostsService;

    constructor()
    {

        this.postsService=new PostsService();

    }

    /**
    * POST /api/posts
    * Crear un nuevo post
    */
    createPost=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=req.user;

            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            const {subtitulo}=req.body

            const post=await this.postsService.createPost(user.id,subtitulo);

            const response:ApiResponse=
            {

                success:true,
                message:'Post creado exitosamente',
                data:post,
                timestamp:new Date().toISOString(),

            }
            res.status(201).json(response)

        }catch(error){

            next(error)

        }

    }

    /**
    * GET /api/posts
    * Listar posts globales (feed publico)
    */
    listGlobalPosts=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const page=parseInt(req.query.page as string)||1;
            const limit=parseInt(req.query.limit as string)||10;

            const result=await this.postsService.listGlobalPosts(page,limit)

            const response:ApiResponse=
            {

                success:true,
                message:'Posts obtenidos exitosamente',
                data:{posts:result.posts,pagination:result.pagination},
                timestamp:new Date().toISOString(),

            };
            res.status(200).json(response);

        }catch(error){

            next(error)

        }

    };

    /**
    * GET /api/posts/user/:userId
    * Listar posts de un usuario
    */
    getUserPosts=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const {userId}=req.params
            const page=parseInt(req.query.page as string)||1;
            const limit=parseInt(req.query.limit as string)||10;

            const result=await this.postsService.getUserPosts(userId,page,limit)

            const response:ApiResponse=
            {

                success:true,
                message:'Posts del usuario obtenidos exitosamente',
                data:{posts:result.posts,pagination:result.pagination},
                timestamp:new Date().toISOString(),

            };
            res.status(200).json(response)


        }catch(error){

            next(error)

        }

    }

    /**
    * GET /api/posts/:postId
    * Obtener un post específico
    */
    getPostById=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const{postId}=req.params

            const post=await this.postsService.getPostById(postId);

            const response:ApiResponse=
            {

                success:true,
                message:'Post obtenido exitosamente',
                data:post,
                timestamp:new Date().toISOString(),

            };
            res.status(200).json(response);

        }catch(error){

            next(error)

        }

    }
    /**
    * PUT /api/posts/:postId
    * Editar un post (solo el autor)
    */
    updatePost=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=req.user;

            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado');

            }
            const{postId}=req.params;
            const{subtitulo}=req.body;

            const post=await this.postsService.updatePost(postId,user.id,subtitulo);

            const response:ApiResponse=
            {

                success:true,
                message:'Post actualizado exitosamente',
                data:post,
                timestamp:new Date().toISOString(),

            };
            res.status(200).json(response);

        }catch(error){

            next(error)

        }

    }
    /**
    * DELETE /api/posts/:postId
    * Eliminar un post (solo el autor)
    */
    deletePost=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=req.user;

            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado');

            }
            const{postId}=req.params;

            await this.postsService.deletePost(postId,user.id);

            const response:ApiResponse=
            {

                success:true,
                message:'Post eliminado exitosamente',
                timestamp:new Date().toISOString(),

            };
            res.status(200).json(response);

        }catch(error){

            next(error)

        }

    }
    /**
    * POST /api/posts/:postId/media
    * Agregar media a un post
    */
    createPostFull=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=req.user
            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            const result=await this.postsService.createPostFull(user.id,req.body)
            const response:ApiResponse={success:true,message:'Post con media creado exitosamente',data:result,timestamp:new Date().toISOString(),}
            res.status(201).json(response)

        }catch(e){next(e)}

    }

   addMedia=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
   {

        try
        {

            const user=req.user;

            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            const{postId}=req.params;
            const{media_url,media_type,position}=req.body;

            const media=await this.postsService.addMedia(postId,user.id,media_url,media_type,position);

            const response:ApiResponse=
            {

                success:true,
                message:'Media agregada exitosamente',
                data:media,
                timestamp:new Date().toISOString(),

            };
            res.status(201).json(response)
            

        }catch(error){

            next(error)

        }

    }
    /**
    * DELETE /api/posts/:postId/media/:mediaId
    * Eliminar media de un post
    */
    deleteMedia=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=req.user;

            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }

            const{postId}=req.params

            await this.postsService.deletePost(postId,user.id)

            const response:ApiResponse=
            {

                success:true,
                message:'Media eliminada exitosamente',
                timestamp:new Date().toISOString(),

            }
            res.status(200).json(response)

        }catch(error){

            next(error)

        }

    }

    

}