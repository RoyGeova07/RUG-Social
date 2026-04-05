//maneja los  de Socket.IO en tiempo real: send_message (maneja texto, sticker y media), 
// delete_message, mark_as_read. Cada usuario se une a su sala personal 
// (userId) para recibir notificaciones aunque no tenga ningun chat abierto.
import { Server as SocketServer,Socket } from 'socket.io';
import{ChatService}from './ChatService'

interface SocketAutenticado extends Socket
{

    userId:string;
    username:string;

}

//payload que llega del cliente al enviar mensaje
interface EnviarMensajePayload
{

    chatId:string;
    type:'texto'|'imagen'|'video'|'audio'|'sticker';
    contenido?:string;
    media_url?:string;
    duracion_segundos?:number
    sticker_id?:string;


}

const chatService=new ChatService()

export const registrarEventosChat=(io:SocketServer):void=>
{

    io.on('connection',(socket:Socket)=>{

        const autenticado=socket as SocketAutenticado;

        //cada usuario se une a su sala personal para recibir notificaciones directas
        //esto permite emitir al usuario aunque no este en ningun chat abierto

        socket.join(autenticado.userId)

        //-----ENVIAR MENSAJEEESSSSSSSSSSSSSSSSSSSSSSSSSSSS-----
        socket.on('send_message',async(payload:EnviarMensajePayload)=>{

            try
            {

                const{chatId,type,contenido,media_url,duracion_segundos,sticker_id}=payload;

                if(!chatId)
                {

                    socket.emit('error',{message:'chatId es requerido'})
                    return;

                }
                let mensaje:any;

                if(type==='texto')
                {

                    if(!contenido||contenido.trim()==='')
                    {

                        socket.emit('error',{message:'El contenido del mensaje no puede estar vacio'})
                        return;

                    }
                    mensaje=await chatService.enviarMensajeTexto(chatId,autenticado.userId,contenido)

                }else if(type==='sticker'){

                    if(!sticker_id)
                    {

                        socket.emit('error',{message:'sticker_id es requerido'})
                        return

                    }
                    mensaje=await chatService.enviarSticker(chatId,autenticado.userId,sticker_id)

                }else if(['imagen','video','audio'].includes(type)){

                    if(!media_url){

                        socket.emit('error',{message:'media_url es requerido'})
                        return

                    }
                    mensaje=await chatService.enviarMensajeMedia(chatId,autenticado.userId,media_url,type,duracion_segundos)

                }else{

                    socket.emit('error',{message:'Tipo de mensaje invalido'})
                    return;

                }
                
                //emitir a todos en la sala (incluido remitente como confirmacion)
                io.to(chatId).emit('new_message',mensaje)

                //notificar a miembros que NO estan en la sala actualmente
                await notificarMiembros(io,chatId,autenticado.userId,mensaje)

            }catch(e:any){

                socket.emit('error',{message:e.message||'Error al enviar el mensaje'})

            }

        })

        //=========================ELIMINAR MENSAJE====================================
        socket.on('delete_message',async(payload:{chatId:string;messageId:string})=>{

            try
            {

                const{chatId,messageId}=payload

                if(!chatId||!messageId)
                {

                    socket.emit('error',{message:'chatId y messageId son requeridos'})
                    return

                }
                await chatService.eliminarMensaje(messageId,autenticado.userId)

                io.to(chatId).emit('message_deleted',{messageId,chatId})

            }catch(e:any){

                socket.emit('error',{message:e.message||'Error al eliminar mensaje'})

            }

        })

        //=======================MARCAR MENSAJES COMO LEIDOS===========================
        socket.on('mark_as_read',async(chatId:string)=>
        {

            try
            {

                if(!chatId)
                {

                    socket.emit('error',{message:'chatId es requerido'})
                    return;

                }
                await chatService.marcarMensajesLeidos(chatId,autenticado.userId)

                //notificar a todos en la sala — el remitente usa esto para el doble check azul
                io.to(chatId).emit('messages_read',
                {

                    chatId,
                    userId:autenticado.userId,
                    username:autenticado.username,

                })

            }catch(e:any){

                socket.emit('error',{message:e.message||'Error al marcar mensaje como leido'})

            }

        })

    })

}

//----------------------------------- HELPER: notificar a miembros que no estan en la sala -----------------------------------
const notificarMiembros=async(io:SocketServer,chatId:string,remitenteId:string,mensaje:any):Promise<void>=>
{

    try
    {

        const socketsEnSala=await io.in(chatId).fetchSockets();
        const idEnSala=new Set(socketsEnSala.map((s:any)=>s.userId));

        const{pool}=await import('../../config/database')
        const miembros=await pool.query('select user_id from chat_members where chat_id=$1 and user_id!=$2',[chatId,remitenteId])

        for(const miembro of miembros.rows)
        {

            if(!idEnSala.has(miembro.user_id))
            {

                io.to(miembro.user_id).emit('new_notification',
                {

                    type:'message',
                    chatId,
                    remitente:{userId:remitenteId,username:mensaje.username},
                    preview:obtenerPreview(mensaje),
                    creado_en:mensaje.creado_en,

                })

            }

        }

    }catch(e){

        console.error('Error al notificar miembros: ',e)

    }

}

// ----------------------------------- HELPER: preview del mensaje para la notificacion -----------------------------------
const obtenerPreview=(mensaje:any):string=>
{

    switch(mensaje.message_type)
    {

        case 'texto':return mensaje.contenido_texto?.substring(0,50)||'';
        case 'imagen':return'📷 Imagen';
        case 'video':return'🎥 Video';
        case 'audio':return'🎵 Audio';
        case 'sticker':return'🎭 Sticker';
        default:return'Mensaje nuevo';

    }

}
