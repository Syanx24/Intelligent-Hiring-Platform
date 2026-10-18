import { Router } from "express";
import {
  createPlan,
  deletePlan,
  listPlans,
  updatePlanCompletion,
} from "./controller.js";

const router = Router();

router.get("/", listPlans);
router.post("/", createPlan);
router.patch("/:id", updatePlanCompletion);
router.delete("/:id", deletePlan);

export default router;
