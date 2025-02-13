import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extending the Request type to include userId & role
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      role?: string;
    }
  }
}

// Authentication Middleware
export const auth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token after "Bearer "
    
    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    const secret = process.env.JWT_SECRET || "your_secret_key"; // Use env variable for security
    const decoded = jwt.verify(token, secret) as { userId: number; role: string };

    if (!decoded) {
      res.status(401).json({ message: "Unauthorized: Invalid token" });
      return;
    }

    req.userId = decoded.userId; // Attach userId to request
    // req.role = decoded.role; // Attach role to request (optional)

    next(); // Proceed to the next middleware or controller
  } catch (error) {
    res.status(403).json({
      message: "Token validation failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    console.error("Auth Error:", error);
    return;
  }
};
