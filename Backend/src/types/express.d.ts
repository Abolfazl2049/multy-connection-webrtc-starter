import "express";

declare global {
  namespace Express {
    interface Request {
      user?: string; // or whatever type your user ID is (UUID in your case)
    }
  }
}
