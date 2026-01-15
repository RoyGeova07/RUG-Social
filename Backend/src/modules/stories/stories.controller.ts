import { Request,Response,NextFunction } from "express";
import { StoriesService } from "./stories.service";
import { ApiResponse } from "../../types/responses";
import { AppError } from "../../middlewares/error.middleware";

export class StoriesController
{

    private storiesService:StoriesService;

    constructor()
    {

        this.storiesService=new StoriesService();

    }
    /**
    * POST /api/stories
    * Crear una nueva story
    */
    createStory=async(_req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(_req as any).user
            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            const{media_url,media_type}=_req.body
            const story=await this.storiesService.createStory(user.id,media_url,media_type)
            const response:ApiResponse=
            {

                success:true,
                message:'Story creada exitosamente',
                data:story,
                timestamp:new Date().toISOString(),

            };
            res.status(201).json(response)


        }catch(error){

            next(error)

        }

    }
    /**
    * GET /api/stories
    * Obtener stories de usuarios que sigo (feed)
    */
    getStoriesFeed=async(_req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(_req as any).user
            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            const stories=await this.storiesService.getStoriesFeed(user.id)
            const response:ApiResponse=
            {

                success:true,
                message:'Stories obtenidas exitosamente',
                data:stories,
                timestamp:new Date().toISOString(),

            };
            res.status(200).json(response)

        }catch(error){

            next(error)

        }

    }
    /**
    * GET /api/stories/me
    * Obtener mis propias stories
    */
    getMyStories=async(_req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(_req as any).user
            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            const stories=await this.storiesService.getMyStories(user.id)
            const response:ApiResponse=
            {

                success:true,
                message:'Tus stories obtenidas exitosamente',
                data:stories,
                timestamp:new Date().toISOString(),

            }
            res.status(200).json(response)

        }catch(error){

            next(error)

        }

    }
    /**
    * DELETE /api/stories/:storyId
    * Eliminar una story
    */
    deleteStory=async(_req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(_req as any).user
            if(!user)
            {

                throw new AppError(401,'Usuario no autenticado')

            }
            const{storyId}=_req.params
            await this.storiesService.deleteStory(storyId,user.id)
            const response:ApiResponse=
            {

                success:true,
                message:'Story Eliminada exitosamente',
                timestamp:new Date().toISOString(),

            }
            res.status(200).json(response)

        }catch(error){

            next(error)

        }

    }

}