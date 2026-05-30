import { Router } from "express";
import {
  addMessage,
  create,
  fetchMessages,
  getAll,
  remove,
} from "../controllers/conversationController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.post("/", create);
router.get("/", getAll);
router.get("/:id/messages", fetchMessages);
router.post("/:id/messages", addMessage);
router.delete("/:id", remove);

export default router;
