import { body,param,query } from "express-validator";

/**
 * validacion para crear post
 */
export const createPostValidation=
[

    body('subtitulo').optional().isLength({max:2200}).withMessage('El subtitulo no puede tener mas de 2200 caracteres'),

]

/**
 * validacion para editar post
 */
export const updatePostValidation=
[

    param('postId').isUUID().withMessage('ID de post invalido'),

    body('subtitulo').isLength({min:1,max:2220}).withMessage('El subtitulo debe tener entre 1 y 2220 caracteres').notEmpty().withMessage('El subtitulo es requerido'),

]

/**
 * validacion para obtener/eliminar post por id
 */
export const postIdValidation=
[

    param('postId').isUUID().withMessage('ID de post invalido'),

]   
/**
 * validacion para listar posts con paginacion
 */
export const listPostsValidation=
[

    query('page').optional().isInt({min:1}).withMessage('La pagina debe ser un numero mayor a 0'),

    query('limit').optional().isInt({min:1,max:50}).withMessage('El limite debe estar entre 1 y 50'),

]

/**
 * validacion para listar posts de un usuario
 */
export const getUserPostsValidation=
[

    param('userId').isUUID().withMessage('ID de usuario invalido'),

    query('page').optional().isInt({min:1}).withMessage('La pagina debe ser un numero mayor a 0'),

    query('limit').optional().isInt({min:1,max:50}).withMessage('El limite de estar entre 1 y 50'),

]
/**
 * validacion para agregar media
 */
export const addMediaValidation=
[

    param('postId').isUUID().withMessage('ID de post invalido'),

    body('media_url').isURL().withMessage('Debe ser una URL invalida').notEmpty().withMessage('La URL de media es requerida'),

    body('media_type').isIn(['imagen','video','image']).withMessage('El tipo de media debe ser: imagen o video').notEmpty().withMessage('El tipo de media es requerido'),

    body('position').optional().isInt({min:1}).withMessage('La posicion debe ser un numero mayor a 0'),

]
/**
 * validacion para eliminar media
 */
export const deleteMediaValidation=
[

    param('postId').isUUID().withMessage('ID de post invalido'),

    param('mediaId').isUUID().withMessage('ID de media invalido'),

]