import bcrypt from "bcryptjs";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { emailTemplates, sendEmail } from "../services/emailService";
import { sessionService } from "../services/sessionService";

const router = Router();

// Helper function to get or generate password hash
function getPasswordHash(envVar: string, fallbackPassword: string): string {
  const envValue = process.env[envVar];

  if (!envValue) {
    console.warn(
      `${envVar} environment variable not set, using fallback password for development`
    );
    return bcrypt.hashSync(fallbackPassword, 10);
  }

  // Check if it's already a bcrypt hash (starts with $2b$)
  if (envValue.startsWith("$2b$")) {
    return envValue;
  }

  // If it's a plain text password, hash it
  console.warn(`${envVar} appears to be plain text, hashing for security`);
  return bcrypt.hashSync(envValue, 10);
}

// Mock user database - in production, this would be a real database
const users = [
  {
    id: "1",
    username: "director",
    password: bcrypt.hashSync("admin", 10), // Forced to 'admin' for development
    name: "Sarah Johnson",
    role: "director",
    email: "director@daycare.com",
  },
  {
    id: "2",
    username: "teacher",
    password: getPasswordHash("TEACHER_PASSWORD_HASH", "teacher123"),
    name: "Maria Garcia",
    role: "teacher",
    email: "teacher@daycare.com",
  },
  {
    id: "3",
    username: "staff",
    password: getPasswordHash("STAFF_PASSWORD_HASH", "staff123"),
    name: "John Smith",
    role: "staff",
    email: "staff@daycare.com",
  },
];

// Debug logging for initialization
console.log("🔐 Auth initialization:");
console.log(`- Available users: ${users.length}`);
console.log(`- Users loaded: ${users.map((u) => u.username).join(", ")}`);
console.log(
  `- Environment variables: DIRECTOR=${!!process.env
    .DIRECTOR_PASSWORD_HASH}, TEACHER=${!!process.env
    .TEACHER_PASSWORD_HASH}, STAFF=${!!process.env.STAFF_PASSWORD_HASH}`
);

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const JWT_SECRET = process.env.JWT_SECRET || "daycare-jwt-secret-2024";

// Login endpoint
router.post("/login", async (req: Request, res: Response) => {
  console.log("👉 Login endpoint hit!");
  console.log("👉 Request body:", JSON.stringify(req.body));
  try {
    const { username, password } = loginSchema.parse(req.body);

    console.log(
      `🔐 Login attempt - username: "${username}" (lowercase: "${username.toLowerCase()}")`
    );
    console.log(
      `🔐 Available users: ${users
        .map(
          (u) => `"${u.username}" (lowercase: "${u.username.toLowerCase()}")`
        )
        .join(", ")}`
    );

    // Find user (case-insensitive)
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (!user || !user.password) {
      console.log(
        `🔐 Login failed - user not found or no password hash: ${username}`
      );
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Verify password using bcrypt
    console.log(`🔐 Attempting login for user: ${username}`);
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`🔐 Password verification result: ${isValidPassword}`);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create session tracking
    const sessionId = await sessionService.createSession({
      userId: user.id,
      username: user.username,
      role: user.role,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Store session ID in express-session
    req.session!.sessionId = sessionId;
    req.session!.userId = user.id;

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
      sessionId,
      message: "Login successful",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid input",
        errors: error.errors,
      });
    }

    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Parent login schema
const parentLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Parent login endpoint
router.post("/parent/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = parentLoginSchema.parse(req.body);

    console.log(`🔐 Parent login attempt - email: "${email}"`);

    // Import storage only when needed
    const { storage } = await import("../storage");

    // Find parent by email
    const parent = await storage.getParentByEmail(email);

    if (!parent) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, parent.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update last login
    await storage.updateParentLastLogin(parent.id);

    // Generate token with 7 days expiration
    const token = jwt.sign(
      {
        userId: parent.id,
        username: parent.username,
        role: "parent",
        parentId: parent.id,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create session tracking
    const sessionId = await sessionService.createSession({
      userId: parent.id,
      username: parent.username,
      role: "parent",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Store session ID in express-session
    req.session!.sessionId = sessionId;
    req.session!.userId = parent.id;

    // Return parent data and token
    res.json({
      token,
      user: {
        id: parent.id,
        username: parent.username,
        name: `${parent.firstName} ${parent.lastName}`,
        role: "parent",
        email: parent.email,
        childrenIds: parent.childrenIds,
      },
      sessionId,
      message: "Login successful",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid request data", errors: error.errors });
    }
    console.error("Parent login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Logout endpoint
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).session?.sessionId;

    if (sessionId) {
      // End the session tracking
      await sessionService.endSession(sessionId, "logout");

      // Destroy express-session
      req.session?.destroy((err: any) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
      });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.json({ message: "Logged out successfully" }); // Still return success
  }
});

// Verify token endpoint
router.get("/verify", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find((u) => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Get current user profile
router.get("/profile", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find((u) => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Password reset request endpoint
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = users.find((u) => u.email === email);

    if (!user) {
      // Don't reveal if email exists for security
      return res.json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // In production, store this in database
    console.log(
      `Password reset requested for ${user.email} with token: ${resetToken}`
    );

    // Generate reset link
    const resetLink = `${
      process.env.BASE_URL || "http://localhost:5000"
    }/reset-password?token=${resetToken}`;

    // Send password reset email
    const emailTemplate = emailTemplates.passwordReset(
      user.username,
      resetLink
    );
    const emailSent = await sendEmail({
      to: user.email,
      ...emailTemplate,
    });

    if (!emailSent) {
      console.warn("Failed to send password reset email");
    }

    res.json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
      // In development only - remove in production
      devToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res
      .status(500)
      .json({ message: "Failed to process password reset request" });
  }
});

// Username recovery endpoint
router.post("/forgot-username", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = users.find((u) => u.email === email);

    if (!user) {
      // Don't reveal if email exists for security
      return res.json({
        success: true,
        message:
          "If an account exists with this email, the username has been sent.",
      });
    }

    // Send username recovery email
    const emailTemplate = emailTemplates.usernameRecovery(
      user.username,
      user.email
    );
    const emailSent = await sendEmail({
      to: user.email,
      ...emailTemplate,
    });

    if (!emailSent) {
      console.warn("Failed to send username recovery email");
    }

    res.json({
      success: true,
      message:
        "If an account exists with this email, the username has been sent.",
      // In development only - remove in production
      devUsername:
        process.env.NODE_ENV === "development" ? user.username : undefined,
    });
  } catch (error) {
    console.error("Username recovery error:", error);
    res
      .status(500)
      .json({ message: "Failed to process username recovery request" });
  }
});

export default router;
