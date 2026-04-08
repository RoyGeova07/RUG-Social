import { body,param,query } from "express-validator";

/**
 * validacion para crear storiy
 */
export const createStoryValidation=
[

    body('media_url').isURL().withMessage('Debe ser una URL valida').notEmpty().withMessage('La URL de media es requerida'),

    body('media_type').isIn(['imagen','video','image']).withMessage('El tipo de media debe ser: imagen o video').notEmpty().withMessage('El tipo de media es requerido')

]

/**
 * validacion para eliminar story
 */
export const deleteStoryValidation=
[

    param('storyId').isUUID().withMessage('ID de story invalido')

]

export const storyViewValidation=
[

    param('storyId').isUUID().withMessage('ID de story invalido'),

]

export const listarVistasValidation=
[
 
    param('storyId').isUUID().withMessage('ID de story invalido'),
 
    query('page').optional().isInt({min:1}).withMessage('La pagina debe ser mayor a 0'),
 
    query('limit').optional().isInt({min:1,max:100}).withMessage('El limite debe estar entre 1 y 100'),
 
];