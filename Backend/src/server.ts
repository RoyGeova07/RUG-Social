import app from './app';
import { testConnection } from './config/database';

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

    app.listen(PORT,()=> 
    {
      console.log('\n ================================');
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log('================================\n');
    });

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