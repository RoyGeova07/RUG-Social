import{Router}from'express'
import { ChatController } from './Chat.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { validar } from '../../middlewares/validation.middleware'
import { crearChatPrivadoValidation,crearChatGrupalValidation,actualizarInfoGrupoValidation,chatIdValidation,agregarMiembroValidation,eliminarMiembroValidation,listarMensajesValidation,listarChatsValidation,buscarStickersValidation, } from './Chat.validation'

const router=Router()
const chatController=new ChatController()

//--------------------STICKERS (RUTAS ESPECIFICAS ANTES DE /:chatId para evitar conflicotsszzz)---------------

/**
 * GET /api/chat/stickers/categories
 * Listar categorias (publico)
 */
router.get('/stickers/categories',chatController.listarCategoriasStickers)

/**
 * GET /api/chat/stickers/search?q=...
 * Buscar stickers (publico)
 */
router.get('/stickers/search',validar(buscarStickersValidation),chatController.buscarStickers)

/**
 * GET /api/chat/stickers
 * Listar stickers (publico)
 */
router.get('/stickers',chatController.listarStickers)


//--------------------------------------------CHATSS------------------------------------------------------------
/**
 * GET /api/chat
 * Listar chats del usuario (requiere autenticacion)
 */
router.get('/',authenticate,validar(listarChatsValidation),chatController.listarChats)

/**
 * POST /api/chat/private
 * Crear o recuperar chat privado (requiere autenticacion)
 */
router.post('/private',authenticate,validar(crearChatPrivadoValidation),chatController.crearChatPrivado)
//===========================================================================================================================
//===========================================================================================================================
//===========================================================================================================================
//===========================================================================================================================
//ARREGLAR ERROR: QUE AUN SALIENDO ERROR AL CREAR GRUPO SIEMPRE SE CREAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAr
/**
 * POST /api/chat/group
 * Crear chat grupal (requiere autenticacion)
 */
router.post('/group',authenticate,validar(crearChatGrupalValidation),chatController.crearChatGrupal)
//===========================================================================================================================
//===========================================================================================================================
//===========================================================================================================================
//===========================================================================================================================
/**
 * GET /api/chat/:chatId/messages
 * Listar mensajes de un chat (requiere autenticacion)
 */
router.get('/:chatId/messages',authenticate,validar(listarMensajesValidation),chatController.listarMensajes)

/**
 * GET /api/chat/:chatId/members
 * Listar miembros (requiere autenticacion)
 */
router.get('/:chatId/members',authenticate,validar(chatIdValidation),chatController.listarMiembros)

/**
 * POST /api/chat/:chatId/members
 * Agregar miembro a grupo (requiere autenticacion)
 */
router.post('/:chatId/members',authenticate,validar(agregarMiembroValidation),chatController.agregarMiembro)

/**
 * DELETE /api/chat/:chatId/members/:userId
 * Eliminar miembro de grupo (requiere autenticacion)
 */

router.delete('/:chatId/members/:userId',authenticate,validar(eliminarMiembroValidation),chatController.eliminarMiembro)

/**
 * PUT /api/chat/:chatId/info
 * Actualizar nombre/descripcion del grupo (requiere autenticacion)
 */
router.put('/:chatId/info',authenticate,validar(actualizarInfoGrupoValidation),chatController.actualizarInfoGrupo)

/**
 * DELETE /api/chat/:chatId/leave
 * Salir de un grupo (requiere autenticacion)
 */
router.delete('/:chatId/leave',authenticate,validar(chatIdValidation),chatController.salirDeGrupo)

export default router;
