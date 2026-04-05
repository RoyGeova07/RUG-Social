import { pool } from "../../config/database";
import { AppError } from "../../middlewares/error.middleware";

export class ChatService
{

    /**
     * 
     * aqui se crea o recupera un chat privado entre 2 usuarios,
     * si ya existe el chat, retorna el exsitente
     * 
     */
    async crearChatPrivado(user1Id:string,user2Id:string):Promise<any>
    {

        try
        {

            const result=await pool.query('Call sp_crear_chat_privado($1,$2,$3)',[user1Id,user2Id,null])

            const chatId=result.rows[0]?.p_chat_id

            if(!chatId)
            {

                throw new AppError(500,'Error al crear chat privado')

            }
            //return await this.obtenerChatPorId(chatId,user1Id)

        }catch(e:any){

            if(e instanceof AppError)throw e
            if(e.message?.includes('no existe o esta inactivo'))
            {

                throw new AppError(404,'Usuario no encontrado o inactivo')

            }
            throw new AppError(500,'Error al crear chat privado')

        }

    }

    /**
     * REQUIERE AL MENOS 3 MIEMBROS, INCLUYENDO AL CREADOR
     */
    async crearChatGrupal(creatorId:string,memberIds:string[],nombre:string,descripcion?:string):Promise<any>
    {

        try
        {

            const result=await pool.query('Call sp_crear_chat_grupal($1,$2,$3,$4,$5)',[creatorId,memberIds,nombre,descripcion||null,null])

            const chatId=result.rows[0]?.p_chat_id

            if(!chatId)
            {

                throw new AppError(500,'Error al crear chat grupal')

            }
            return await this.obtenerInfoChat(chatId,creatorId)

        }catch(e:any){

            if(e instanceof AppError)throw e
            if(e.message?.includes('El nombre del grupo es requerido'))
            {

                throw new AppError(400,'El nombre del grupo es requerido')

            }
            if(e.message?.includes('al menos 3 miembros'))
            {

                throw new AppError(400,'Un chat grupal requiere al menos 3 miembros, incluyendo al creador')

            }
            if(e.message?.includes('no existe o esta inactivo'))
            {

                throw new AppError(404,'Uno o mas usuarios no encontrados o inactivos')

            }
            throw new AppError(500,'Error al crear chat grupal')

        }

    }

    async actualizarInfoGrupo(chatId:string,userId:string,nombre?:string,descripcion?:string):Promise<void>
    {

        try
        {

            await pool.query('Call sp_actualizar_info_grupo($1,$2,$3,$4)',[chatId,userId,nombre,descripcion||null])

        }catch(e:any){

            if(e instanceof AppError)throw e;
            if(e.message?.includes('no existe o no es grupal'))
            {
                throw new AppError(404,'Chat grupal no encontrado');
            }
            if(e.message?.includes('No eres miembro'))
            {
                throw new AppError(403,'No eres miembro de este grupo');
            }
            throw new AppError(500,'Error al actualizar info del grupo');

        }

    }
    async obtenerInfoChat(chatId:string,userId:string):Promise<any>
    {

        try
        {

            const result=await pool.query(`select c.id,c.nombre,c.descripcion,c.creado_en,
                (select count(*)from chat_members where chat_id=c.id)::int 
                as miembros_count from chats c where c.id=$1`,[chatId])

            if(result.rowCount===0)
            {

                throw new AppError(404,'Chat no encontrado');  

            }
            const chat=result.rows[0]

            //si es chat privado con otra persona, oobtener info del otro usuario
            if(!chat.is_group&&chat.miembros_count===2)
            {

                const otroUsuario=await pool.query(`select u.id,pr.username,pr.full_name,pr.avatar_url,us.status
                                                from chat_members cm
                                                inner join users u on u.id=cm.user_id
                                                inner join user_profiles pr on pr.user_id=u.id
                                                left join user_status us on us.user_id=u.id
                                                where cm.chat_id=$1 and cm.user_id!=$2
                                                limit 1`,[chatId,userId]);
                chat.otroUsuario=otroUsuario.rows[0]||null
                                        
            }else if(!chat.is_group&&chat.miembros_count===1){

                //self-chat
                chat.otro_usuario=null
                chat.es_self_chat=true

            }
            return chat

        }catch(e:any){

            if(e instanceof AppError)throw e;
            throw new AppError(500,'Error al obtener info del chat');

        }

    }
    /**
     * Listar todos los chats del usuario con ultimo mensaje y mensajes no leidos
    */
    async listarChatsUsuario(userId:string,page:number=1,limit:number=20):Promise<any>
    {

        try
        {

            const offset=(page-1)*limit
            const result=await pool.query('select *from fn_listar_chats_usuario($1,$2,$3)',[userId,limit,offset])

            const countResult=await pool.query('select count(*)from chat_members where user_id=$1',[userId])

            const total=parseInt(countResult.rows[0].count)
            const totalPages=Math.ceil(total/limit)

            return{

                chats:result.rows,
                pagination:{page,limit,total,totalPages},

            }

        }catch(e){

            throw new AppError(500,'Error al listar chats');

        }

    }

    //--MENSAJEEES-------------------------------------------------------------------------------------------------------------------------------
    //--MENSAJEEES-------------------------------------------------------------------------------------------------------------------------------

    /**
     * Enviar mensaje de texto
     * Retorna el mensaje completo para emitirlo por socket
     */
    async enviarMensajeTexto(chatId:string,remitenteId:string,contenido:string):Promise<any>
    {

        try
        {

            const result=await pool.query('Call sp_enviar_mensaje_texto($1,$2,$3,$4)',[chatId,remitenteId,contenido,null])
            const mensajeId=result.rows[0]?.p_mensaje_id

            if(!mensajeId)
            {

                throw new AppError(500,'Error al enviar mensaje')

            }
            //return await this.obtener

        }catch(e:any){

            if(e instanceof AppError)throw e;
            if(e.message?.includes('no existe'))
            {
                throw new AppError(404,'Chat no encontrado');
            }
            if(e.message?.includes('No eres miembro'))
            {
                throw new AppError(403,'No eres miembro de este chat');
            }
            if(e.message?.includes('no puede estar vacio'))
            {
                throw new AppError(400,'El mensaje no puede estar vacio');
            }
            throw new AppError(500,'Error al enviar mensaje');

        }

    }

    /**
     * Enviar mensaje de media (imagen, video, audio)
     * El frontend sube el archivo a Cloudinary/S3 y manda la URL
     * 
     */
    async enviarMensajeMedia(chatId:string,remitenteId:string,mediaUrl:string,mediaType:string,duracionSegundo?:number):Promise<any>
    {

       try
       {

            const result=await pool.query('Call sp_enviar_mensaje_media($1,$2,$3,$4,$5,$6)',[chatId,remitenteId,mediaUrl,mediaType,duracionSegundo||null,null])
            const messageId=result.rows[0]?.p_message_id

            if(!messageId)
            {

                throw new AppError(500,'Error al enviar mensaje de media')

            }
            return await this.obtenerMensaje(messageId)

        }catch(e:any){

            
            if(e instanceof AppError)throw e;
            if(e.message?.includes('No eres miembro'))
            {
                throw new AppError(403,'No eres miembro de este chat');
            }
            if(e.message?.includes('Tipo de media invalido'))
            {
                throw new AppError(400,'Tipo de media invalido. Debe ser: audio, imagen o video');
            }
            throw new AppError(500,'Error al enviar mensaje media');

        }

    }

    async enviarSticker(chatId:string,remitenteId:string,stickerId:string):Promise<any>
    {

        try
        {

            const result=await pool.query('Call sp_enviar_sticker($1,$2,$3)',[chatId,remitenteId,stickerId,null])
            const messageId=result.rows[0]?.p_message_id

            if(!messageId)
            {

                throw new AppError(500,'Error al enviar sticker')

            }
            return await this.obtenerMensaje(messageId)

        }catch(e:any){

            if(e instanceof AppError)throw e;
            if(e.message?.includes('No eres miembro'))
            {

                throw new AppError(403,'No eres miembro de este chat');

            }
            if(e.message?.includes('sticker no existe'))
            {

                throw new AppError(404,'Sticker no encontrado');

            }
            throw new AppError(500,'Error al enviar sticker');

        }

    }

    /**
     * Obtener un mensaje completo por ID
     * Se usa internamente despues de insertar para retornar el mensaje completo
     */
    async obtenerMensaje(mensajeId:string):Promise<any>
    {

        try
        {

            const result=await pool.query(`select 
                                        m.id,m.chat_id,m.remitente_id,pr.username,pr.foto_perfil_url,m.message_type,m.contenido_texto,mm.media_url,mm.media_type,mm.duracion_segundos,s.sticker_url,m.is_read,m.creado_en
                                        from messages m
                                        inner join profiles pr on pr.user_id=m.remitente_id
                                        left join messages_media mm on mm.message_id=m.id
                                        left join message_stickers ms on ms.message_id=m.id)
                                        left join stickers s on s.id=ms.sticker_id
                                        where m.id=$1`,[mensajeId]);
            
            if(result.rowCount===0)
            {

                throw new AppError(404,'Mensaje no encontrado');

            }
            return result.rows[0]


        }catch(e){

            if(e instanceof AppError)throw e;
            throw new AppError(500,'Error al obtener mensaje');

        }

    }

    /**
     * Listar mensajes de un chat con paginacion
     * Los mensajes vienen ordenados del mas reciente al mas antiguo
     */
    async listarMensajes(chatId:string,userId:string,page:number=1,limit:number=20):Promise<any>
    {

        try
        {

            const offset=(page-1)*limit
            const result=await pool.query('select *from fn_listar_mensajes_chat($1,$2,$3,$4)',[chatId,userId,limit,offset])

            const countResult=await pool.query('select count(*)from messages where chat_id=$1',[chatId])

            const total=parseInt(countResult.rows[0].count)
            const totalPages=Math.ceil(total/limit)

            return{

                messages:result.rows,
                pagination:{page,limit,total,totalPages},

            }

        }catch(e:any){

            if(e.message?.includes('No eres miembro'))
            {

                throw new AppError(403,'No eres miembro de este chat');

            }
            throw new AppError(500,'Error al obtener mensajes');

        }

    }
    
    async eliminarMensaje(mensajeId:string,userId:string):Promise<void>
    {

        try
        {

            await pool.query('Call sp_eliminar_mensaje($1,$2)',[mensajeId,userId])

        }catch(e:any){

            if(e instanceof AppError)throw e;
            if(e.message?.includes('no existe'))
            {

                throw new AppError(404,'Mensaje no encontrado');

            }
            if(e.message?.includes('propios mensajes'))
            {

                throw new AppError(403,'Solo puedes eliminar tus propios mensajes');

            }
            throw new AppError(500,'Error al eliminar mensaje');

        }

    }
     /**
     * Marcar todos los mensajes de un chat como leidos
     * Retorna chatId y userId para emitir la confirmacion por socket
     */
    async marcarMensajesLeidos(chatId:string,userId:string):Promise<{chatId:string,userId:string}>
    {

        try
        {

            await pool.query('Call sp_marcar_mensajes_leidos($1,$2)',[chatId,userId])

            return{chatId,userId}

        }catch(e:any){

            
            if(e.message?.includes('No eres miembro'))
            {

                throw new AppError(403,'No eres miembro de este chat');

            }
            throw new AppError(500,'Error al marcar mensajes como leidos');


        }   
            

    }
    //------------------------MIEMBROSSSSSSSSSSSS---------------------------------------------------------------------
    //------------------------MIEMBROSSSSSSSSSSSS---------------------------------------------------------------------
    /**
     * Agregar miembro a un grupo
     * Cualquier miembro del grupo puede agregar a otro
     */
    async agregarMiembro(chatId:string,adminId:string,newMemberId:string):Promise<void>
    {

        try
        {

            await pool.query('Call sp_agregar_miembro_grupo($1,$2,$3)',[chatId,adminId,newMemberId])

        }catch(e:any){

            if(e instanceof AppError)throw e;
            if(e.message?.includes('no existe o no es grupal'))
            {

                throw new AppError(404,'Chat grupal no encontrado');

            }
            if(e.message?.includes('No eres miembro'))
            {
                
                throw new AppError(403,'No eres miembro de este grupo');

            }
            if(e.message?.includes('ya es miembro'))
            {

                throw new AppError(400,'El usuario ya es miembro del grupo');

            }
            throw new AppError(500,'Error al agregar miembro');

        }

    }
    
    async eliminarMiembro(chatId:string,adminId:string,memberId:string):Promise<void>
    {

        try
        {

            await pool.query('Call sp_eliminar_miembro_grupo($1,$2,$3)',[chatId,adminId,memberId])


        }catch(e:any){

            if(e instanceof AppError)throw e;
            if(e.message?.includes('no existe o no es grupal'))
            {

                throw new AppError(404,'Chat grupal no encontrado');

            }
            if(e.message?.includes('No eres miembro'))
            {

                throw new AppError(403,'No eres miembro de este grupo');

            }
            throw new AppError(500,'Error al eliminar miembro');

        }

    }
    /**
     * Salir de un grupo
     * Si el grupo queda con menos de 2 miembros, se elimina automaticamente (logica en el SP)
     */
    async salirGrupo(chatId:string,userId:string):Promise<void>
    {

        try
        {

            await pool.query('Call sp_salir_de_grupo($1,$2)',[chatId,userId])

        }catch(e:any){

            if(e instanceof AppError)throw e;
            if(e.message?.includes('no existe o no es grupal'))
            {

                throw new AppError(404,'Chat grupal no encontrado');

            }
            if(e.message?.includes('No eres miembro'))
            {

                throw new AppError(403,'No eres miembro de este grupo');

            }
            throw new AppError(500,'Error al salir del grupo');

        }

    }
    //===============================================================================================================================================
    //===============================================================================================================================================
    //===============================================================================================================================================
    //===============================================================================================================================================
    //===============================================================================================================================================
    //===============================================================================================================================================
    //FALTA ELIMINAR CHATTTTTTTT PARA CHAT PRIVADOS, DONDE ELIMINAR UNICAMENTE LOS CHATS PARA EL USUARIO 
    // QUE BORRO EL CHAT, TAMBIEN PASA LO MISMO CON LOS GRUPOSSS
    //===============================================================================================================================================
    //===============================================================================================================================================
    //===============================================================================================================================================
    //===============================================================================================================================================
    //===============================================================================================================================================
    //===============================================================================================================================================
    //===============================================================================================================================================
    
    async listarMiembros(chatId:string,userId:string):Promise<any>
    {

        try
        {

            //primero se verifica q el usuario sea miembro antes de mostrar la lista 
            const esMiembro=await pool.query('select 1 from chat_members where chat_id=$1 and user_id=$2',[chatId,userId])

            if(esMiembro.rows.length===0)
            {

                throw new AppError(403,'No eres miembro de este chat')

            }
            const result=await pool.query(`select 
                                        u.id,pr.username,pr.full_name,pr.foto_perfil_url,us.status,us.last_seen
                                        from chat_members cm
                                        inner join users u on u.id=cm.user_id
                                        inner join profiles pr on pr.user_id=u.id
                                        left join user_status us on us.user_id=u.id
                                        where cm.chat_id=$1
                                        order by pr.username asc`,[chatId])
                
            return result.rows

        }catch(e){


            if(e instanceof AppError)throw e;
            throw new AppError(500,'Error al listar miembros');

        }

    }

    //--------------STICKERS---------------------------------------------------------
    //--------------STICKERS---------------------------------------------------------
    async listarStickers(category?:string,limit:number=50,offset:number=0):Promise<any>
    {

        try
        {

            const result=await pool.query('SELECT *FROM fn_listar_stickers($1,$2,$3)',[category||null,limit,offset])

            return result.rows

        }catch(e){

            throw new AppError(500,'Error al listar stickers')

        }

    }

    async listarCategoriasStickers():Promise<any>
    {
 
        try
        {
 
            const result=await pool.query('SELECT * FROM fn_listar_categorias_stickers()');
            return result.rows;
 
        }catch(error){
 
            throw new AppError(500,'Error al listar categorias de stickers');
 
        }
 
    }

    async buscarStickers(searchTerm:string,limit:number=20):Promise<any>
    {
 
        try
        {
 
            const result=await pool.query('SELECT * FROM fn_buscar_stickers($1,$2)',[searchTerm,limit]);
 
            return result.rows;
 
        }catch(error){
 
            throw new AppError(500,'Error al buscar stickers');
 
        }
 
    }




}