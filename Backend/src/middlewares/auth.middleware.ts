import{Request,Response,NextFunction}from"express";
import{VerificarToken}from'utils/jwt';
import{AppError}from './error.middleware';

export const Auntenticar=(req:Request,res=Response,next:NextFunction):void=>
{

    try
    {

        //obtener el token del header
        const autHeader=req.headers.authorization;

        if(!autHeader||!autHeader.startsWith('Bearer '))
        {

            throw new AppError(401,'Token no proporcionado o formato invalido');

        }
        const token=autHeader.split(' ')[1];

        //aqui se verifica el token
        const descifrado=VerificarToken(token);

        //agregar la informacion del usuario al request
        req.user=
        {

            id:descifrado.id,
            email:descifrado.email,
            username:descifrado.username,
            is_active:true,

        };
        next();

    }catch(error){

        if(error instanceof AppError)
        {

            next(error);

        }else{

            next(new AppError(401,'Token invalido o expirado'));

        }

    }

};

//no lanzara error si no hay token
export const Autorizacion=(req:Request,res:Response,next:NextFunction):void=>
{

    try
    {

        const authHeader=req.headers.authorization;

        if(authHeader&&authHeader.startsWith('Bearer '))
        {

            const token=authHeader.split(' ')[1];
            const descifrado=VerificarToken(token);

            req.user=
            {

                id:descifrado.id,
                email:descifrado.email,
                username:descifrado.username,
                is_active:true,

            };

        }
        next();

    }catch(error){

        //si falla, continuar sin usuario
        next();

    }

}