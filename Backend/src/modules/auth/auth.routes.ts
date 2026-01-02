import { Router } from "express";
import { AuthController } from "../../modules/auth/auth.controller";
import { RegistrarValidacion,loginValidacion } from "../../modules/auth/auth.validation";
import { validar } from "../../middlewares/validation.middleware";
import { authenticate } from "../../middlewares/auth.middleware";

/**
 * 
 * Rutas de autenticacion
 * 
 * 
 */

const router=Router();
const authController=new AuthController();

/**
 * POST /api/auth/register
 * Registro de nuevo usuario
 * 
 * - Publico (no requiere autenticacion)
 * - Validaciones aplicadas
 */
//                      valida datos        verifica errores            ejecuta el controller
router.post('/register',validar(RegistrarValidacion),authController.register);

router.post('/login',loginValidacion,validar(loginValidacion),authController.login);

/**
 * GET /api/auth/me
 * Obtener perfil del usuario autenticado
 * 
 * - Requiere autenticacion (token JWT)
 * - No requiere validaciones adicionales
 */

router.get('/me',authenticate,authController.getMe);


export default router;