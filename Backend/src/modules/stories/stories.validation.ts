import { body,param } from "express-validator";

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