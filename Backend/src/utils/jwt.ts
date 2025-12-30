import jwt,{SignOptions}from'jsonwebtoken';

interface JwtPayload
{

    id:string;
    email:string;
    username:string;

}

export const GenerarToken=(payload:JwtPayload):string=>
{

    const secreto=process.env.JWT_SECRET;

    if(!secreto)
    {

        throw new Error('JWT_SECRET no esta definigo en las variables de entorno');

    }

    
    return jwt.sign(payload,secreto,{expiresIn:process.env.JWT_EXPIRES_IN||'7d',}as jwt.SignOptions);

};

export const VerificarToken=(Token:string):JwtPayload=>
{

    const secreto=process.env.JWT_SECRET;

    if(!secreto)
    {

        throw new Error('JWT_SECRET no esta definigo en las variables de entorno');

    }

    try
    {

        return jwt.verify(Token,secreto)as JwtPayload;

    }catch(error){

        throw new Error('Token invalido o expirado');

    }

}