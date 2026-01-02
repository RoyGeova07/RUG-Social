import { Request,Response,NextFunction }from"express";
import { validationResult,ValidationChain }from"express-validator";
import { ApiResponse }from"../../src/types/responses";

export const validar=(validations:ValidationChain[])=>
{

    return async(req:Request,res:Response,next:NextFunction)=>
    {

        //ejecutar las validaciones
        await Promise.all(validations.map((validation)=>validation.run(req)));

        const errors=validationResult(req);

        if(errors.isEmpty())
        {

            return next();

        }
        //formatear errores
        const formattedErrors=errors.array().map((err)=>
        ({
            
            field:err.type==='field'?err.path:'unknown',
            message:err.msg,

        }));

        const response:ApiResponse=
        {

            success:false,
            message:'Errores de validacion',
            error:JSON.stringify(formattedErrors),

        }
        res.status(400).json(response);

    };

};