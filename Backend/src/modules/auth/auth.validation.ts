import { body }from"express-validator";

/*

    validaciones para el registro de usuario
    verifica q todos los campos cumplan los requisitos

*/
export const RegistrarValidacion=
[

    //validar email
    body('email').isEmail().withMessage('Debe ser un email valido').normalizeEmail().notEmpty().withMessage('El email es requerido'),

    //validar constrasena
    body('password').isLength({min:6}).withMessage('La contraseña debe tener al menos 6 caracteres').matches(/\d/).withMessage('La constraseña debe contener al menos un numero').notEmpty().withMessage('La contraseña es requerida'),

    //validar username
    body('username').isLength({min:3,max:50}).withMessage('El username debe tener entre 3 y 50 caracteres').matches(/^[a-zA-Z0-9_]+$/).withMessage('El username solo puede contener letras, numeros y guion bajo').notEmpty().withMessage('El username es requerido'),

    //validar nombre completo
    body('full_name').isLength({min:2,max:120}).withMessage('El nombre debe tener entre 2 y 120 caracteres').notEmpty().withMessage('El nombre completo es requerido'),

    //validar fecha de nacimiento
    body('nacimiento').isISO8601().withMessage('Debe ser una fecha valida (YYYY-MM-DD)').custom((value)=>{

        const birthDate=new Date(value);
        const today=new Date();
        const age=today.getFullYear()-birthDate.getFullYear();

        if(age<13)
        {

            throw new Error('Debes tener al menos 13 años para registrarte');

        }

        if(age>120)
        {

            throw new Error('Fecha de nacimiento invalida');

        }
        return true;
        
    }).notEmpty().withMessage('La fecha de nacimiento es requerida'),

];

/**
 * validaciones para el login
 * solo necesitamos email y contrasenia
 * 
 */
export const loginValidacion=
[

    body('email').isEmail().withMessage('Debe ser un email valido').normalizeEmail().notEmpty().withMessage('El email es requerido'),

    body('password').notEmpty().withMessage('La constraseña es requerida'),

];

