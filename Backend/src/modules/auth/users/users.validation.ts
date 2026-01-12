import { body,param,query } from "express-validator";

/**
 * 
 * validacion para actualizar perfil
 * 
 */

export const ActualizarPerfilValidacion=
[

    body('full_name').optional().isLength({min:2,max:120}).withMessage('El nombre debe tener entre 2 y 120 caracteres'),

    body('bio').optional().isLength({max:500}).withMessage('La bio no puede tener mas de 500 caracteres'),

    body('foto_perfil_url').optional().isURL().withMessage('Debe ser una URL valida'),

    body('Nacimiento').optional().isISO8601().withMessage('Debe ser una fecha valida (YYY-MM-DD)').custom((value)=>
    {

        const birthDate=new Date(value);
        const hoy=new Date();
        const anio=hoy.getFullYear()-birthDate.getFullYear();

        if(anio<13)
        {

            throw new Error('Debes tener al menos 13 años');

        }
        if(anio>120)
        {

            throw new Error('Fecha de nacimiento invalida');

        }
        return true;

    }),

];

/**
 * 
 * validacion para perfil por username
 * 
 */

export const getUserByUsernameValidation=
[

    param('username').isLength({min:3,max:50}).withMessage('Username invalido').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username solo puede contener letras, numeros y guion bajo'),

];

/**
 * 
 * validacion para seguir/dejar de seguir
 * 
 */
export const followUserValidation=
[

    param('userId').isUUID().withMessage('ID de usuario invalido'),

];

/**
 * 
 * validacion para listar usuarios
 * 
 */
export const ListarUsuarioValidacion=
[

    query('page').optional().isInt({min:1}).withMessage('La pagina debe ser un numero mayor a 0'),

    query('limit').optional().isInt({min:1,max:100}).withMessage('La busqueda debe de tener entre 1 y 50 caracteres'),

];

/**
 * 
 * validacion para ver seguidos y seguidores
 * 
 */
export const getFollowListValidation=
[

    param('userId').isUUID().withMessage('ID de usuario invalido'),

    query('page').optional().isInt({min:1}).withMessage('La pagina debe ser un numero mayor a 0'),

    query('limit').optional().isInt({min:1,max:100}).withMessage('El limite debe estar entre 1 y 100'),

];