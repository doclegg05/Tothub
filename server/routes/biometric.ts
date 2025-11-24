import { Router } from "express";
import { storage } from "../storage";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const auth = authMiddleware;

// Enroll biometric data
router.post('/enroll/:userType/:userId', auth, async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const { faceDescriptor, fingerprintCredentialId } = req.body;

    if (userType === 'child') {
      const child = await storage.getChild(userId);
      if (!child) {
        return res.status(404).json({ error: 'Child not found' });
      }

      const updateData: any = {
        biometricEnrolledAt: new Date(),
        biometricEnabled: true,
      };
      if (faceDescriptor) updateData.faceDescriptor = faceDescriptor;
      if (fingerprintCredentialId) updateData.fingerprintHash = fingerprintCredentialId;
      
      await storage.updateChild(userId, updateData);
    } else if (userType === 'staff') {
      const staff = await storage.getStaff(userId);
      if (!staff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      await storage.updateStaff(userId, {
        faceDescriptor: faceDescriptor || staff.faceDescriptor,
        fingerprintHash: fingerprintCredentialId || staff.fingerprintHash,
        biometricEnrolledAt: new Date(),
        biometricEnabled: true,
      });
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    res.json({ success: true, message: 'Biometric data enrolled successfully' });
  } catch (error) {
    console.error('Biometric enrollment error:', error);
    res.status(500).json({ error: 'Failed to enroll biometric data' });
  }
});

// Get biometric auth data
router.get('/auth-data/:userType/:userId', auth, async (req, res) => {
  try {
    const { userType, userId } = req.params;

    let user;
    if (userType === 'child') {
      user = await storage.getChild(userId);
    } else if (userType === 'staff') {
      user = await storage.getStaff(userId);
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      hasFaceData: !!user.faceDescriptor,
      hasFingerprintData: !!user.fingerprintHash,
      biometricEnabled: user.biometricEnabled || false,
      faceDescriptor: user.faceDescriptor,
      fingerprintHash: user.fingerprintHash,
    });
  } catch (error) {
    console.error('Get biometric data error:', error);
    res.status(500).json({ error: 'Failed to get biometric data' });
  }
});

// Verify biometric data
router.post('/verify/:userType/:userId', auth, async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const { method, confidence } = req.body;

    let user;
    if (userType === 'child') {
      user = await storage.getChild(userId);
    } else if (userType === 'staff') {
      user = await storage.getStaff(userId);
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.biometricEnabled) {
      return res.status(400).json({ error: 'Biometric authentication not enabled for this user' });
    }

    const minimumConfidence = method === 'fingerprint' ? 0.9 : 0.6;
    
    if (confidence < minimumConfidence) {
      return res.status(401).json({ error: 'Biometric verification failed' });
    }

    res.json({
      success: true,
      method,
      confidence,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Biometric verification error:', error);
    res.status(500).json({ error: 'Failed to verify biometric data' });
  }
});

export default router;