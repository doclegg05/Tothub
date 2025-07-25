import express from 'express';
import { storage } from '../storage';

const router = express.Router();

// Enroll biometric data for a user
router.post('/enroll/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const { faceDescriptor, fingerprintCredentialId } = req.body;

    if (userType === 'child') {
      const child = await storage.getChild(userId);
      if (!child) {
        return res.status(404).json({ error: 'Child not found' });
      }

      await storage.updateChild(userId, {
        faceDescriptor: faceDescriptor || child.faceDescriptor,
        fingerprintHash: fingerprintCredentialId || child.fingerprintHash,
        biometricEnrolledAt: new Date(),
        biometricEnabled: true,
      });
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

// Get biometric data for authentication
router.get('/auth-data/:userType/:userId', async (req, res) => {
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

    // Only return whether biometric data exists, not the actual data
    res.json({
      hasFaceData: !!user.faceDescriptor,
      hasFingerprintData: !!user.fingerprintHash,
      biometricEnabled: user.biometricEnabled || false,
    });
  } catch (error) {
    console.error('Get biometric data error:', error);
    res.status(500).json({ error: 'Failed to get biometric data' });
  }
});

// Verify biometric authentication
router.post('/verify/:userType/:userId', async (req, res) => {
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

    // In a real implementation, you would verify the biometric data here
    // For this demo, we assume the client-side verification is sufficient
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

// Disable biometric authentication
router.post('/disable/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;

    if (userType === 'child') {
      await storage.updateChild(userId, {
        biometricEnabled: false,
      });
    } else if (userType === 'staff') {
      await storage.updateStaff(userId, {
        biometricEnabled: false,
      });
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    res.json({ success: true, message: 'Biometric authentication disabled' });
  } catch (error) {
    console.error('Disable biometric error:', error);
    res.status(500).json({ error: 'Failed to disable biometric authentication' });
  }
});

export default router;