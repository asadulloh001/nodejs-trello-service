import { Router } from "express";
import {
  getAllTasks,
  searchTask,
  getTaskById,
  createTask,
  updateTask,
  removeTask,
} from "../controllers/index.js";
const router = Router();

router.get("/", getAllTasks);
router.get("/search", searchTask);
router.get("/:id", getTaskById);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", removeTask);

export default router;