import { Router } from "express";
import { storage } from "../storage";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const auth = authMiddleware;

// Update state compliance
router.post('/state', auth, async (req, res) => {
  try {
    const { state } = req.body;
    if (!state) {
      return res.status(400).json({ message: "State is required" });
    }

    // Get state compliance data
    const { getStateRatios } = await import("@shared/stateComplianceData");
    const ratiosData = getStateRatios(state);
    
    if (!ratiosData) {
      return res.status(400).json({ message: "Invalid state selected" });
    }

    // Update state setting
    await storage.createOrUpdateSetting('selected_state', state);
    
    // Update compliance data
    const compliance = await storage.updateStateCompliance(state, `Updated via API`);

    // Create alert for compliance update
    await storage.createAlert({
      type: "general",
      message: `Updated compliance settings for ${state} - review for compliance.`,
      severity: "medium",
      isRead: false,
    });

    res.json({ 
      success: true, 
      compliance,
      message: `State compliance updated to ${state}` 
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update state compliance" });
  }
});

// Get available states
router.get('/available-states', auth, async (req, res) => {
  try {
    const { US_STATES_LIST, STATE_COMPLIANCE_RATIOS } = await import("@shared/stateComplianceData");
    
    const statesWithData = US_STATES_LIST.map(state => ({
      name: state,
      hasData: !!STATE_COMPLIANCE_RATIOS[state],
      ratios: STATE_COMPLIANCE_RATIOS[state] || null
    }));

    res.json(statesWithData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch available states" });
  }
});

// Get state-specific ratios
router.get('/:state/ratios', auth, async (req, res) => {
  try {
    const { state } = req.params;
    const { getStateRatios } = await import("@shared/stateComplianceData");
    
    const ratios = getStateRatios(state);
    if (!ratios) {
      return res.status(404).json({ message: "State ratios not found" });
    }

    res.json({
      state,
      ratios,
      notes: ratios.notes
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch state ratios" });
  }
});

export default router;