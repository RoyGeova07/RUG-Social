import { Router } from "express";
import { StoriesController } from "./stories.controller";
import { createStoryValidation,deleteStoryValidation } from "./stories.validation";
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
 * GET /api/stories
 * Ver feed de stories (requiere autenticacion)
 */
router.get('/',authenticate,storiesController.getStoriesFeed)

/**
 * GET /api/stories/me
 * Ver mis propias stories (requiere autenticacion)
 */
router.get('/me',authenticate,storiesController.getMyStories)

/**
 * DELETE /api/stories/:storyId
 * Eliminar story (requiere autenticacion)
 */
router.delete('/:storyId',authenticate,validar(deleteStoryValidation),storiesController.deleteStory)

export default router;