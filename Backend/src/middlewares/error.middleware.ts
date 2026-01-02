import { Request,Response,NextFunction } from "express";
import { ApiResponse } from "../../src/types/responses";

//Clase para errores operacionales
export class AppError extends Error
{

    constructor(public statusCode:number,public message: string,public isOperational=true)
    {

        super(message);
        Object.setPrototypeOf(this,AppError.prototype);
        Error.captureStackTrace(this,this.constructor);


    }

}

//Middleware para manejar errores
export const ManejarErrorres=(err:Error|AppError,_req:Request,res:Response,_next:NextFunction):void=>
{

    //si es un error operacional(esperado)
    if(err instanceof AppError)
    {

        const respuesta:ApiResponse=
        {

            success:false,
            message:err.message,
            error:process.env.NODE_ENV==='development'?err.stack:undefined,
            timestamp:new Date().toISOString(),

        };
        res.status(err.statusCode).json(respuesta);
        return;

    }
    //error no manejado(inesperado)
    console.error('ERROR NO MANEJADO: ',err);

    const respuesta:ApiResponse=
    {

        success:false,
        message:'Error interno del servidor',
        error:process.env.NODE_ENV==='development'?err.message:undefined,
        timestamp:new Date().toISOString(),

    };

    res.status(500).json(respuesta);
};

//Middleware para rutas no encontradas
export const notFound=(req:Request,res:Response):void=>
{

    const response:ApiResponse=
    {

        success:false,
        message:`Ruta no encontrada: ${req.method} ${req.originalUrl}`,
        timestamp:new Date().toISOString(),

    };
    res.status(404).json(response);

}

//Middleware para async/await - evita try-catch repetitivos
export const asyncHandler=(fn:(req:Request,res:Response,next:NextFunction)=>Promise<any>)=>
{

    return(req:Request,res:Response,next:NextFunction)=>
    {

        Promise.resolve(fn(req,res,next)).catch(next);

    }

};