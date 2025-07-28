import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sessionService } from '../services/sessionService';

const router = Router();

// Helper function to get or generate password hash
function getPasswordHash(envVar: string, fallbackPassword: string): string {
  const envValue = process.env[envVar];
  
  if (!envValue) {
    console.warn(`${envVar} environment variable not set, using fallback password for development`);
    return bcrypt.hashSync(fallbackPassword, 10);
  }
  
  // Check if it's already a bcrypt hash (starts with $2b$)
  if (envValue.startsWith('$2b$')) {
    return envValue;
  }
  
  // If it's a plain text password, hash it
  console.warn(`${envVar} appears to be plain text, hashing for security`);
  return bcrypt.hashSync(envValue, 10);
}

// Mock user database - in production, this would be a real database
const users = [
  {
    id: '1',
    username: 'director',
    password: getPasswordHash('DIRECTOR_PASSWORD_HASH', 'WVvalues25!'),
    name: 'Sarah Johnson',
    role: 'director',
    email: 'director@daycare.com',
  },
  {
    id: '2',
    username: 'teacher',
    password: getPasswordHash('TEACHER_PASSWORD_HASH', 'teacher123'),
    name: 'Maria Garcia',
    role: 'teacher',
    email: 'teacher@daycare.com',
  },
  {
    id: '3',
    username: 'staff',
    password: getPasswordHash('STAFF_PASSWORD_HASH', 'staff123'),
    name: 'John Smith',
    role: 'staff',
    email: 'staff@daycare.com',
  },
];

// Debug logging for initialization
console.log('🔐 Auth initialization:');
console.log(`- Available users: ${users.length}`);
console.log(`- Users loaded: ${users.map(u => u.username).join(', ')}`);
console.log(`- Environment variables: DIRECTOR=${!!process.env.DIRECTOR_PASSWORD_HASH}, TEACHER=${!!process.env.TEACHER_PASSWORD_HASH}, STAFF=${!!process.env.STAFF_PASSWORD_HASH}`);

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const JWT_SECRET = process.env.JWT_SECRET || 'daycare-jwt-secret-2024';

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    
    console.log(`🔐 Login attempt - username: "${username}" (lowercase: "${username.toLowerCase()}")`);
    console.log(`🔐 Available users: ${users.map(u => `"${u.username}" (lowercase: "${u.username.toLowerCase()}")`).join(', ')}`);

    // Find user (case-insensitive)
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || !user.password) {
      console.log(`🔐 Login failed - user not found or no password hash: ${username}`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify password using bcrypt
    console.log(`🔐 Attempting login for user: ${username}`);
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`🔐 Password verification result: ${isValidPassword}`);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create session tracking
    const sessionId = await sessionService.createSession({
      userId: user.id,
      username: user.username,
      role: user.role,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
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
      message: 'Login successful',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: error.errors 
      });
    }
    
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).session?.sessionId;
    
    if (sessionId) {
      // End the session tracking
      await sessionService.endSession(sessionId, 'logout');
      
      // Destroy express-session
      req.session?.destroy((err: any) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
      });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.json({ message: 'Logged out successfully' }); // Still return success
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
    
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Get current user profile
router.get('/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
    
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;