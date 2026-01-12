import { Router } from "express";
import { UsersControllers } from "./users.controller";
import { ActualizarPerfilValidacion,getUserByUsernameValidation,followUserValidation,ListarUsuarioValidacion,getFollowListValidation } from "./users.validation";
import { validar } from "../../../middlewares/validation.middleware";
import { authenticate } from "../../../middlewares/auth.middleware";

const router=Router();
const usersController=new UsersControllers();

/**
 * GET /api/users
 * Listar usuarios (público)
*/
router.get('/',validar(ListarUsuarioValidacion),usersController.listUsers);

/**
 * PUT /api/users/profile
 * Actualizar mi perfil(requiere autenticacion)
*/
router.put('/profile',authenticate,validar(ActualizarPerfilValidacion),usersController.updateProfile)


/**
 * GET /api/users/:username
 * Ver perfil de usuario por username(publico)
*/
router.get('/:username',validar(getUserByUsernameValidation),usersController.getUsersByUsername)

/**
 * POST /api/users/follow/:userId
 * Seguir a un usuario(requiere autenticacion)
*/
router.post('/follow/:userId',authenticate,validar(followUserValidation),usersController.followUser)

/**
 * DELETE /api/users/follow/:userId
 * Dejar de seguir(requiere autenticacion)
*/
router.delete('/follow/:userId',authenticate,validar(followUserValidation),usersController.unfollowUser)

/**
 * GET /api/users/:userId/followers
 * Ver seguidores de un usuario(publico)
*/
router.get('/:userId/followers',validar(getFollowListValidation),usersController.getFollowers)

/**
 * GET /api/users/:userId/following
 * Ver usuarios que sigue(publico)
*/
router.get('/:userId/following',validar(getFollowListValidation),usersController.getFollowing)

export default router;