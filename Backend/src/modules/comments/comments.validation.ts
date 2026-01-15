import { body,param,query } from 'express-validator';

/**
 * Validacion para crear comentario
 */
export const createCommentValidation=
[

  param('postId').isUUID().withMessage('ID de post invalido'),

  body('contenido').notEmpty().withMessage('El contenido del comentario es requerido').isLength({ min:1,max:1000}).withMessage('El comentario debe tener entre 1 y 1000 caracteres').trim(),

];

/**
 * Validacion para listar comentarios
 */
export const listCommentsValidation=
[

  param('postId').isUUID().withMessage('ID de post invalido'),

  query('page').optional().isInt({min:1}).withMessage('La pagina debe ser un numero mayor a 0'),

  query('limit').optional().isInt({min:1,max:100}).withMessage('El limite debe estar entre 1 y 100'),

];

/**
 * Validacion para eliminar comentario
 */
export const deleteCommentValidation=
[

  param('commentId').isUUID().withMessage('ID de comentario invalido'),

];