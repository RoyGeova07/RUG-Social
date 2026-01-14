import { Router } from "express";
import { LikesController } from "./likes.controller";
import { postIdValidation,listLikesValidation } from "./likes.validation";
import { validar } from "../../../middlewares/validation.middleware";
import { authenticate } from "../../../middlewares/auth.middleware";

const router=Router();
const likesController=new LikesController();

/**
 * POST /api/likes/:postId
 * Dar like a un post (requiere autenticacion)
 */
router.post('/:postId',authenticate,validar(postIdValidation),likesController.likePost)

/**
 * DELETE /api/likes/:postId
 * Quitar like de un post (requiere autenticacion)
 */
router.delete('/:postId',authenticate,validar(postIdValidation),likesController.unlikePost)


/**
 * GET /api/likes/:postId/check
 * Verificar si el usuario dio like (requiere autenticacion)
 */
router.get('/:postId/check',authenticate,validar(postIdValidation),likesController.checkUserLike)

/**
 * GET /api/likes/:postId
 * Obtener lista de likes (publico)
 */
router.get('/:postId',validar(listLikesValidation),likesController.getPostLikes)

export default router;
