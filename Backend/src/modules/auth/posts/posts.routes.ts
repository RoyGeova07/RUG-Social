import { Router } from "express";
import { PostsController } from "./posts.controller";
import { createPostValidation,updatePostValidation,postIdValidation,listPostsValidation,getUserPostsValidation,addMediaValidation,deleteMediaValidation } from "./posts.validation";
import { validar } from "../../../middlewares/validation.middleware";
import { authenticate } from "../../../middlewares/auth.middleware";

const router=Router();
const postsController=new PostsController();

/**
 * POST /api/posts
 * Crear post (requiere autenticacion)
 */
router.post('/',authenticate,validar(createPostValidation),postsController.createPost)

/**
 * GET /api/posts
 * Listar posts globales (publico)
 */
router.get('/',validar(listPostsValidation),postsController.listGlobalPosts)

/**
 * GET /api/posts/user/:userId
 * Listar posts de un usuario (publico)
 */
router.get('/user/:userId',validar(getUserPostsValidation),postsController.getUserPosts)

/**
 * POST /api/posts/:postId/media
 * Agregar media a un post (requiere autenticacion)
 */
router.post('/:postId/media',authenticate,validar(addMediaValidation),postsController.addMedia)

/**
 * DELETE /api/posts/:postId/media/:mediaId
 * Eliminar media de un post (requiere autenticacion)
 */
router.delete('/:postId/media/:mediaId',authenticate,validar(deleteMediaValidation),postsController.deleteMedia)

/**
 * GET /api/posts/:postId
 * Ver post especifico (publico)
 */
router.get('/:postId',validar(postIdValidation),postsController.getPostById)

/**
 * PUT /api/posts/:postId
 * Editar post (requiere autenticacion)
 */
router.put('/:postId',authenticate,validar(updatePostValidation),postsController.updatePost)

/**
 * DELETE /api/posts/:postId
 * Eliminar post (requiere autenticacion)
 */
router.delete('/:postId',authenticate,validar(postIdValidation),postsController.deletePost)

export default router;
