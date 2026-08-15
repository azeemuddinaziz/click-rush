import { Router } from "express";

const router = Router();

router.route("/check").get((req, res) => {
  res.json({ msg: "Hello World!" });
});

export default router;
