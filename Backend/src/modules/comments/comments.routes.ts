import { Router } from "express";
import { validar } from "../../middlewares/validation.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { CommentsController } from "./comments.controller";
import { createCommentValidation,listCommentsValidation,deleteCommentValidation } from "./comments.validation";

const router=Router()
const commentsController=new CommentsController();

/**
 * POST /api/comments/:postId
 * Crear comentario (requiere autenticacion)
 */
router.post('/:postId',authenticate,validar(createCommentValidation),commentsController.createComment)

/**
 * GET /api/comments/:postId
 * Listar comentarios de un post (público)
 */
router.get('/:postId',validar(listCommentsValidation),commentsController.getPostComments)

/**
 * DELETE /api/comments/:commentId
 * Eliminar comentario (requiere autenticacion)
 */
router.delete('/:commentId',authenticate,validar(deleteCommentValidation),commentsController.deleteComment)

export default router;