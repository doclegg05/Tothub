import { Router } from "express";
import { QuickBooksExporter } from "../services/quickbooksExporter";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const auth = authMiddleware;

// Export pay period data
router.get("/export/pay-period", auth, async (req, res) => {
  try {
    const { startDate, endDate, format } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }
    
    const exportFormat = (format as string) || 'csv';
    
    if (exportFormat === 'iif') {
      const iifData = await QuickBooksExporter.exportPayPeriodIIF(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="payroll_${startDate}_${endDate}.iif"`);
      res.send(iifData);
    } else {
      const csvData = await QuickBooksExporter.exportPayPeriodCSV(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="payroll_${startDate}_${endDate}.csv"`);
      res.send(csvData);
    }
  } catch (error) {
    console.error('Export pay period error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to export pay period data" 
    });
  }
});

// Generate GL summary
router.get("/export/gl-summary", auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }
    
    const summary = await QuickBooksExporter.generateGLSummary(
      parseInt(month as string),
      parseInt(year as string)
    );
    
    res.json(summary);
  } catch (error) {
    console.error('GL summary error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to generate GL summary" 
    });
  }
});

// Tax Reports (941, State)
router.get("/export/tax-reports", auth, async (req, res) => {
  try {
    const { quarter, year } = req.query;
    
    if (!quarter || !year) {
      return res.status(400).json({ message: "Quarter and year are required" });
    }

    const reports = await QuickBooksExporter.generateTaxReports(
      parseInt(quarter as string),
      parseInt(year as string)
    );
    
    res.json(reports);
  } catch (error) {
    console.error('Tax reports error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to generate tax reports" 
    });
  }
});

export default router;