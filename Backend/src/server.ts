import { createServer } from 'http';
import app from './app';
import { testConnection } from './config/database';
import { InicializarSocket } from './socket/socket';

const PORT=process.env.PORT||3000;

const IniciarServidor=async():Promise<void> => 
{
  try 
  {

    console.log('INICIANDO SERVIDOR...');
    console.log(`Entorno: ${process.env.NODE_ENV}`);

    console.log('Probando conexion a PostgreSQL...');
    const Conectado=await testConnection();

    if(!Conectado) 
    {

      console.error('Fock no se pudo conectar a la base de datos');
      console.error('Verifica tu archivo .env y que PostgreSQL este corriendo');
      process.exit(1);

    }

    //IMPORTANTEEEEEE: crear el servidor HTTP manualmente para que socket.io lo comparta con Express
    const httpServer=createServer(app)

    //inicializar Socket.io con el servidor HTTP
    const io=InicializarSocket(httpServer)

    httpServer.listen(PORT,()=> 
    {

      console.log('\n ================================');
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Socket.IO: activo`);
      console.log('================================\n');

    });

    io.on('connection',()=>
    {

      const count=io.engine.clientsCount
      console.log(`Usuarios conectados: ${count}`); 

    })

  }catch(error){

    console.error('Error fatal al iniciar servidor:',error);
    process.exit(1);

  }
};

process.on('unhandledRejection',(reason,promise)=>
{

  console.error('Unhandled Rejection at: ',promise,'reason: ',reason);
  process.exit(1);

});

IniciarServidor();