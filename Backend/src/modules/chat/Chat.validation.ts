import { body,param,query } from "express-validator";

export const crearChatPrivadoValidation=
[

    body('userId').isUUID().withMessage('ID de usuario invalido').notEmpty().withMessage('userId es requerido'),

]

export const crearChatGrupalValidation=
[

    body('nombre').notEmpty().withMessage('El nombre del grupo es requerido').isLength({min:1,max:100}).withMessage('El nombre debe tener entre 1 y 100 caracteres'),

    body('descripcion').optional().isLength({max:500}).withMessage('La descripcion no puede tener mas de 500 caracteres'),

    body('memberIds').isArray({min:2}).withMessage('Se requieren al menos 2 miembros ademas del creador'),

    body('memberIds.*').isUUID().withMessage('Uno o mas IDs de miembros son invalidos'),

]

export const actualizarInfoGrupoValidation=
[

    param('chatId').isUUID().withMessage('ID de chat invalido'),

    body('nombre').optional().isLength({min:1,max:100}).withMessage('El nombre debe tener entre 1 y 100 caracteres'),

    body('descripcion').optional().isLength({max:500}).withMessage('La descripcion no puede tener mas de 500 caracteres'),

]

export const chatIdValidation=
[

    param('chatId').isUUID().withMessage('ID de chat invalido'),

]

export const agregarMiembroValidation=
[

    param('chatId').isUUID().withMessage('ID de chat invalido'),

    body('userId').isUUID().withMessage('ID de usuario invalido').notEmpty().withMessage('userId es requerido'),

]

export const eliminarMiembroValidation=
[

    param('chatId').isUUID().withMessage('ID de chat invalido'),

    param('userId').isUUID().withMessage('ID de usuario invalido'),

]

export const listarMensajesValidation=
[

    param('chatId').isUUID().withMessage('ID de chat invalido'),

    query('page').optional().isInt({min:1}).withMessage('La pagina debe ser mayor a 0'),

    query('limit').optional().isInt({min:1,max:100}).withMessage('El limite debe estar entre 1 y 100'),

]

export const listarChatsValidation=
[

    query('page').optional().isInt({min:1}).withMessage('La pagina debe ser mayor a 0'),

    query('limit').optional().isInt({min:1,max:50}).withMessage('El limite de estar entre 1 y 50'),

]

export const buscarStickersValidation=
[

    query('q').notEmpty().withMessage('El termino de busqueda es requerido').isLength({min:1,max:50}).withMessage('El termino debe tener entre 1 y 50 caracteres'),

    query('limit').optional().isInt({min:1,max:50}).withMessage('El limite debe estar entre 1 y 50'),

]