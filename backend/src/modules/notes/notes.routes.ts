import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate';
import * as notesController from './notes.controller';

export const notesRouter = Router();

notesRouter.use(authenticate);

notesRouter.get('/', notesController.list);
notesRouter.post('/', notesController.create);
notesRouter.get('/:id', notesController.getOne);
notesRouter.patch('/:id', notesController.update);
notesRouter.delete('/:id', notesController.remove);
