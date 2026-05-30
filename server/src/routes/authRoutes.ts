import { Response, Router } from "express";
import { login, register } from "../controllers/authController";
import { AuthRequest, protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, (req: AuthRequest, res: Response) => {
  res.json({ message: "Protected route works", userId: req.userId });
});

export default router;
