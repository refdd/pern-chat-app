import express from "express"
import { getMe, login, logout, signup } from "../controllers/auth.controller.js"
import { body, validationResult } from "express-validator";
import {Request, Response , NextFunction} from "express";
import protectRoute from "../middleware/protectRoute.js";
const router = express.Router()
// Validation middleware
const validate = (req: Request, res: Response, next : NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  };
router.get("/me", protectRoute, getMe);
router.post("/login", [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ], login)
router.post("/logout", logout)
router.post(
    "/signup",
    [
      body("fullName").notEmpty().withMessage("Full name is required"),
      body("username")
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters long"),
      body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
      body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required")
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("Passwords don't match");
          }
          return true;
        }),
      body("gender")
        .notEmpty()
        .withMessage("Gender is required")
        .isIn(["male", "female"])
        .withMessage("Gender must be either 'male' or 'female'"),
    ],
    validate,
    signup
  );

export default router