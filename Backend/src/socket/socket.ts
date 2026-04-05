/**
 * 
 *  Inicializa Socket.IO, verifica JWT en cada conexion, 
 *  une a cada usuario a su sala personal (su userId) para recibir notificaciones directas, 
 *  y registra los eventos del gateway.
 * 
 */

//configuracion socket.io + middleware de autenticacion
import {Server as HttpServer}from 'http';
import {Server as SocketServer, Socket} from 'socket.io';
import { VerificarToken } from '../utils/jwt';
import { pool } from '../config/database';
import { registrarEventosChat } from '../modules/chat/Chat.gateway';

//interfaz para el socket autenticado 
interface SocketAutenticado extends Socket
{

    userId:string;
    username:string;

}

let io:SocketServer;

export const InicializarSocket=(httpServer:HttpServer):SocketServer=>
{

    io=new SocketServer(httpServer,
    {

        cors:
        {

            origin:process.env.ALLOWED_ORIGIN?.split(',')||'*',
            credentials:true,

        },
        //tiempo maximo sin actividad antes de desconectar
        pingTimeout:60000,
        pingInterval:25000,

    })

    //middleware de autenticacion
    io.use((socket,next)=>
    {


        try
        {

            //el cliente envia el token en el handshake
            const token=socket.handshake.auth?.token||socket.handshake.headers?.authorization?.split(' ')[1];

            if(!token)
            {

                return next(new Error('Token no proporcionado'));

            }
            const descifrado=VerificarToken(token);

            //adjuntar datos del usuario al socket
            (socket as SocketAutenticado).userId=descifrado.id;
            (socket as SocketAutenticado).username=descifrado.username;

            next();

        }catch(error){

            next(new Error('Token no valido o expirado'));

        }

    })

    //manejo de eventos de conexion
    io.on('connection',(socket:Socket)=>
    {

        const autenticado=socket as SocketAutenticado;
        console.log(`Usuario conectado: ${autenticado.username} (${autenticado.userId})`);

        //actualizar estado del usuario a conectado
        actualizarEstado(autenticado.userId,'online');

        //unirse a un chat
        socket.on('join_chat',async(chatId:string)=>
        {

            try
            {

                //se verifica q el usuario es miembro del chat
                const esMiembro=await VerificarMiembro(autenticado.userId,chatId)

                if(!esMiembro)
                {

                    socket.emit('error',{message:'No eres miembro de este chat'})
                    return;

                }

                socket.join(chatId);
                console.log(`Usuario ${autenticado.username} se unio al chat ${chatId}`);

            }catch(error){

                socket.emit('error',{message:'Error al unirse al chat'});

            }

        })

        //salir de un chat
        socket.on('leave_chat',async(chatId:string)=>
        {


            socket.leave(chatId);
            console.log(`Usuario ${autenticado.username} salio del chat ${chatId}`);

        })

        //typing indicator
        socket.on('typing_start',(chatId:string)=>
        {

            //emitir a todoss en el chat excepto al que escribe
            socket.to(chatId).emit('user_typing',
            {

                chatId,
                userId:autenticado.userId, 
                username:autenticado.username

            });



        })
        socket.on('typing_stop',(chatId:string)=>
        {

            socket.to(chatId).emit('user_stopped_typing',
            {

                chatId,
                userId:autenticado.userId,

            })

        })
            
        //desconexion
        socket.on('disconnect',()=>
        {

            console.log(`Usuario desconectado: ${autenticado.username}`);
            actualizarEstado(autenticado.userId,'offline')

        })

    });

    //registrar todos los eventos del modulo de chat (mensajes,leidos,notificaciones)
    registrarEventosChat(io)

    return io;

}

//getter para usar io en otros archivos
export const getIO=():SocketServer=>
{

    if(!io)
    {

        throw new Error('Socket.io no ha sido inicializado. Llama a InicializarSocket primero.');

    }
    return io;

}

//helpers internos
const VerificarMiembro=async(userId:string,chatId:string):Promise<boolean>=>
{

    const result=await pool.query('SELECT 1 FROM chat_members WHERE chat_id=$1 AND user_id=$2',[chatId,userId]) 

    return result.rows.length>0;

}

const actualizarEstado=async(userId:string,status:'online'|'offline'):Promise<void>=>
{

    try
    {

        await pool.query(`INSERT INTO user_status(user_id,status,last_seen)values($1,$2,current_timestamp)ON CONFLICT(user_id)DO UPDATE SET status=$2, last_seen=current_timestamp`,[userId,status])

    }catch(error){

        console.error('Error al actualizar estado del usuario:',error);

    }
    
}