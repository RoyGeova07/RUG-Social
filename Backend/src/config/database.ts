/*

Esta carpeta de config sirve para:

Para cargar variables de entorno (.env)
Configurar CORS
Configurar Express
Manejar puertos y ajustes globales

*/

import {Pool}from 'pg';
import dotenv from 'dotenv';

dotenv.config();

//configuracion de la conexion
export const pool=new Pool
({

    host:process.env.DB_HOST,
    port:Number(process.env.DB_PORT),
    database:process.env.DB_NAME,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    max:20,
    idleTimeoutMillis:30000,
    connectionTimeoutMillis:2000,

});

//aqui los evento de conexion
pool.on('connect',()=>
{

    console.log('SIIIIIIII, BASE DE DATOS CONECTADAAAAAAAAAAAAAAAAAAAA');

});

pool.on('error',(err)=>
{

    console.error('ERROR EN CONEXION CON LA BASE DE DATOS FOK', err);
    process.exit(-1);

});

//funcion para probar la conexion
export const testConnection=async():Promise<boolean>=>
{

    try
    {

        const cliente=await pool.connect();
        const resultado=await cliente.query('SELECT NOW()as now, current_database()as database');
        console.log("AHHHH TEST DE CONEXION EXITOSAAAAA");
        console.log(`Base de datos: ${resultado.rows[0].database}`);
        console.log(`Hora del servidor: ${resultado.rows[0].now}`);
        cliente.release();
        return true;

    }catch(error){

        console.error('ERROR AL PROBAR LA CONEXION CON LA BASE DE DATOS FOK', error);
        return false;

    }

};

//funcion helper para ejecutar consultas
export const query=async(text:string,params?:any[])=>
{

    const start=Date.now();
    try
    {

        const resultado=await pool.query(text,params);
        const duracion=Date.now()-start;
        if(process.env.NODE_ENV==='development')
        {

            console.log(`Query ejecutado en ${duracion}ms - Filas: ${resultado.rowCount}`);

        }
        return resultado;
        
    }catch(error){

        console.error('Error en la consulta: ',error);
        throw error;

    }

};

//helper para llamar stored de procedures
export const callProcedure=async(procedureName:string,params:any[]=[]):Promise<void>=>
{

    const placeholders=params.map((_,i)=>`$${i+1}`).join(', ');
    const SQL=`CALL ${procedureName}(${placeholders})`;
    await query(SQL,params);

};

//helper para llamar funciones que retornan las tablas
export const callFunction=async<T=any>(functionName:string,params:any[]=[]):Promise<T[]>=>
{

    const placeholders=params.map((_,i)=> `$${i+1}`).join(', ');
    const SQL=`SELECT*FROM ${functionName}(${placeholders})`;
    const result=await query(SQL,params);
    return result.rows as T[];

};

