import { param,query } from "express-validator";

/**
 * validacion para dar/quitar like y verificar
 */
export const postIdValidation=
[

    param('postId').isUUID().withMessage('ID de post invalido'),

];

/**
 * validacion para listar likes con paginacion
 */
export const listLikesValidation=
[

    param('postId').isUUID().withMessage('ID de post invalido'),

    query('page').optional().isInt({min:1}).withMessage('La pagina debe ser un numero mayor a 0'),

    query('limit').optional().isInt({min:1,max:300}).withMessage('El limite debe estar entre 1 y 100'),

]
