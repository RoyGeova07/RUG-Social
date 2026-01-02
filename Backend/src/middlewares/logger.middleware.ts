import { Request,Response,NextFunction } from "express";

export const logger=(req:Request,res:Response,next:NextFunction):void=>
{

    const inicio=Date.now();

    res.on('finish',()=>
    {

        const duracion=Date.now()-inicio;
        const {method,originalUrl}=req;
        const{statusCode}=res;

        const logMessage=`${method} ${originalUrl} ${statusCode} - ${duracion}ms`;

        if(statusCode>=400)
        {

            console.error(`${logMessage}`);

        }else{

            console.log(`${logMessage}`);

        }

    });
    next();

};