import express from "express";
const router = express.Router();
import verifyToken from "../utils/verifyToken.js";
import * as eventControllers from "../controllers/event.js";
import upload from "../middleware/upload.js";

router.post("/create", verifyToken, upload.single("image"), eventControllers.createEvent);
router.get("/", eventControllers.getAllEvents);
router.get('/:id', eventControllers.getEvent);
router.put('/:id', verifyToken, eventControllers.addUserToEvent);
router.patch('/:id', verifyToken, upload.single("image"), eventControllers.editEvent);
router.delete('/:id', verifyToken, eventControllers.deleteEvent);
router.delete('/:id/unregister', verifyToken, eventControllers.unregisterUser);


// Q&A Routes
router.post('/:id/questions', verifyToken, eventControllers.addQuestion);
router.post('/:id/questions/:questionId/answers', verifyToken, eventControllers.addAnswer);


export default router;