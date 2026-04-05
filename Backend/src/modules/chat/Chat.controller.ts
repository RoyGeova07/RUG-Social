import { Request,Response,NextFunction }from'express';
import { ChatService } from './ChatService';
import { ApiResponse } from '../../types/responses';
import { AppError } from '../../middlewares/error.middleware';

const chatService=new ChatService();

export class ChatController
{

    //-----------------------------------CHATSSSS-----------------------------------
    /**
     * POST /api/chat/private
     * Crear o recuperar chat privado
     * Si userId === usuario autenticado, crea un self-chat (Mis notas)
     */
    crearChatPrivado=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(req as any).user;
            if(!user)throw new AppError(401,'Usuario no autenticado')
            const{userId}=req.body
            const chat=await chatService.crearChatPrivado(user.id,userId)
            const response:ApiResponse={success:true,message:'Chat listo',data:chat,timestamp:new Date().toISOString()}
            res.status(200).json(response)

        }catch(e){next(e)}

    }

    /**
     * POST /api/chat/group
     * Crear chat grupal
     */
    crearChatGrupal=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(req as any).user
            if(!user)throw new AppError(401,'Usuario no autenticado')
            const{memberIds,nombre,descripcion}=req.body
            const chat=await chatService.crearChatGrupal(user.id,memberIds,nombre,descripcion)
            const response:ApiResponse={success:true,message:'Chat grupal creado exitosamente',data:chat,timestamp:new Date().toISOString()}
            res.status(201).json(response)

        }catch(e){next(e)}

    }

     /**
     * PUT /api/chat/:chatId/info
     * Actualizar nombre y/o descripcion de un grupo
     */
    actualizarInfoGrupo=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(req as any).user
            if(!user)throw new AppError(401,'Usuario no autenticado')
            const{chatId}=req.params
            const{nombre,descripcion}=req.body
            await chatService.actualizarInfoGrupo(chatId,user.id,nombre,descripcion)
            const response:ApiResponse={success:true,message:'Informacion del grupo actualizada correctamente',timestamp:new Date().toISOString()}
            res.status(200).json(response)
            

        }catch(e){next(e)}

    }

    /**
     * GET /api/chat
     * Listar chats del usuario
     */
    listarChats=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(req as any).user
            if(!user)throw new AppError(401,'Usuario no autenticado')            
            const page=parseInt(req.query.page as string)||1;
            const limit=parseInt(req.query.limit as string)||20;
            const result=await chatService.listarChatsUsuario(user.id,page,limit)
            const response:ApiResponse={success:true,message:'Chats obtenidos exitosamente',data:{chats:result.chats,pagination:result.pagination},timestamp:new Date().toISOString()};
            res.status(200).json(response);
            

        }catch(e){next(e)}

    }
    
    /**
     * GET /api/chat/:chatId/messages
     * Listar mensajes de un chat con paginacion
     */
    listarMensajes=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(req as any).user;
            if(!user)throw new AppError(401,'Usuario no autenticado');
            const{chatId}=req.params;
            const page=parseInt(req.query.page as string)||1;
            const limit=parseInt(req.query.limit as string)||30;
            const result=await chatService.listarMensajes(chatId,user.id,page,limit)
            const response:ApiResponse={success:true,message:'Mensajes obtenidos exitosamente',data:{messages:result.messages,pagination:result.pagination},timestamp:new Date().toISOString()}
            res.status(200).json(response)
 

        }catch(e){next(e)}

    }
    //============================================MIEMBROSSSS===================================================
    //============================================MIEMBROSSSS===================================================
     /**
     * GET /api/chat/:chatId/members
     */
    listarMiembros=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(req as any).user;
            if(!user)throw new AppError(401,'Usuario no autenticado');
            const{chatId}=req.params;            
            const members=await chatService.listarMiembros(chatId,user.id)
            const response:ApiResponse={success:true,message:'Miembros obtenidos exitosamente',data:members,timestamp:new Date().toISOString()}
            res.status(200).json(response)

        }catch(e){next(e)}

    }

    /**
     * POST /api/chat/:chatId/members
     */
    agregarMiembro=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(req as any).user;
            if(!user)throw new AppError(401,'Usuario no autenticado');
            const{chatId}=req.params;
            const{userId}=req.body;
            await chatService.agregarMiembro(chatId,user.id,userId)
            const response:ApiResponse={success:true,message:'Miembro agregado exitosamente',timestamp:new Date().toISOString()}
            res.status(200).json(response)
 

        }catch(e){next(e)}


    }

     /**
     * DELETE /api/chat/:chatId/members/:userId
     */
    eliminarMiembro=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(req as any).user
            if(!user)throw new AppError(401,'Usuario no autenticado');
            const{chatId,userId}=req.params
            await chatService.eliminarMiembro(chatId,user.id,userId)
            const response:ApiResponse={success:true,message:'Miembro eliminado exitosamente',timestamp:new Date().toISOString()}
            res.status(200).json(response)

        }catch(e){next(e)}

    }

     /**
     * DELETE /api/chat/:chatId/leave
     */
    salirDeGrupo=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const user=(req as any).user
            if(!user)throw new AppError(401,'Usuario no autenticado');
            const{chatId}=req.params
            await chatService.salirGrupo(chatId,user.id)
            const response:ApiResponse={success:true,message:'Saliste del grupo exitosamente',timestamp:new Date().toISOString()}
            res.status(200).json(response)

        }catch(e){next(e)}

    }

    //============================================STICKERSSSS===================================================
    //============================================STICKERSSSS===================================================
    /**
     * GET /api/chat/stickers/categories
     */
    listarCategoriasStickers=async(_req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const categories=await chatService.listarCategoriasStickers()
            const response:ApiResponse={success:true,message:'Categorias obtenidas exitosamente',data:categories,timestamp:new Date().toISOString()}
            res.status(200).json(response)

        }catch(e){next(e)}

    }

    /**
     * GET /api/chat/stickers/search?q=...
    */
    buscarStickers=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const q=req.query.q as string
            if(!q)throw new AppError(400,'El termino de busqueda es requerido')
            const limit=parseInt(req.query.limit as string)||20
            const stickers=await chatService.buscarStickers(q,limit)
            const response:ApiResponse={success:true,message:'Busqueda completada',data:stickers,timestamp:new Date().toISOString()}
            res.status(200).json(response)

        }catch(e){next(e)}

    }

     /**
     * GET /api/chat/stickers
     */
    listarStickers=async(req:Request,res:Response,next:NextFunction):Promise<void>=>
    {

        try
        {

            const category=req.query.category as string|undefined
            const limit=parseInt(req.query.limit as string)||50
            const offset=parseInt(req.query.offset as string)||0
            const stickers=await chatService.listarStickers(category,limit,offset)
            const response:ApiResponse={success:true,message:'Stickers obtenidos exitosamente',data:stickers,timestamp:new Date().toISOString()}
            res.status(200).json(response)

        }catch(e){next(e)}

    }
    



}