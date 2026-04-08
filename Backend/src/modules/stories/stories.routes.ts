import { Router } from "express";
import { StoriesController } from "./stories.controller";
import { createStoryValidation,deleteStoryValidation, listarVistasValidation, storyViewValidation } from "./stories.validation";
import { validar } from "../../middlewares/validation.middleware";
import { authenticate } from "../../middlewares/auth.middleware";

const router=Router()
const storiesController=new StoriesController();

/**
 * POST /api/stories
 * Crear story (requiere autenticacion)
 */
router.post('/',authenticate,validar(createStoryValidation),storiesController.createStory)

/**
 * GET /api/stories/me
 * Mis stories activas (requiere autenticacion)
 * VA ANTES de /:storyId para evitar conflictos de rutas
 */
router.get('/me',authenticate,storiesController.getMyStories)

/**
 * GET /api/stories
 * Ver feed de stories (requiere autenticacion)
 */
router.get('/',authenticate,storiesController.getStoriesFeed)

/**
 * POST /api/stories/:storyId/view
 * Registrar vista de una story (requiere autenticacion)
 * Se llama cada vez que el frontend muestra la story al usuario
 */
router.post('/:storyId/view',authenticate,validar(storyViewValidation),storiesController.registrarVista)

/**
 * GET /api/stories/:storyId/views
 * Ver quien vio mi story (requiere autenticacion, solo el autor)
 */
router.get('/:storyId/views',authenticate,validar(listarVistasValidation),storiesController.listarVista)

/**
 * DELETE /api/stories/:storyId
 * Eliminar story (requiere autenticacion)
 */
router.delete('/:storyId',authenticate,validar(deleteStoryValidation),storiesController.deleteStory)

export default router;