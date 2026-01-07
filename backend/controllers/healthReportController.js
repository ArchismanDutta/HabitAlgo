import HealthReport from '../models/HealthReport.js';

// Helper function to calculate metric status
function calculateStatus(value, referenceRange) {
  if (value < referenceRange.min) return 'low';
  if (value > referenceRange.max) return 'high';
  return 'normal';
}

// ===== HEALTH REPORTS CRUD =====

// Create new health report
export const createHealthReport = async (req, res) => {
  try {
    const userId = req.user._id;

    // Calculate status for each metric
    const metricsWithStatus = req.body.metrics.map(metric => ({
      ...metric,
      status: calculateStatus(metric.value, metric.referenceRange)
    }));

    const report = await HealthReport.create({
      ...req.body,
      userId,
      metrics: metricsWithStatus
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update existing health report
export const updateHealthReport = async (req, res) => {
  try {
    const userId = req.user._id;

    // Calculate status for each metric
    const metricsWithStatus = req.body.metrics.map(metric => ({
      ...metric,
      status: calculateStatus(metric.value, metric.referenceRange)
    }));

    const report = await HealthReport.findOneAndUpdate(
      { _id: req.params.id, userId },
      {
        ...req.body,
        metrics: metricsWithStatus
      },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all health reports for user
export const getHealthReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, category } = req.query;

    const query = { userId };

    if (startDate && endDate) {
      query.reportDate = { $gte: startDate, $lte: endDate };
    }

    const reports = await HealthReport.find(query).sort({ reportDate: -1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single health report by ID
export const getHealthReport = async (req, res) => {
  try {
    const userId = req.user._id;

    const report = await HealthReport.findOne({
      _id: req.params.id,
      userId
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get latest health report
export const getLatestHealthReport = async (req, res) => {
  try {
    const userId = req.user._id;

    const report = await HealthReport.findOne({ userId })
      .sort({ reportDate: -1 });

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete health report
export const deleteHealthReport = async (req, res) => {
  try {
    const userId = req.user._id;

    const report = await HealthReport.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== ANALYTICS =====

// Get trends for specific metric across all reports
export const getMetricTrend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { metricName, limit = 12 } = req.query;

    const reports = await HealthReport.find({ userId })
      .sort({ reportDate: -1 })
      .limit(parseInt(limit));

    // Extract specific metric from each report
    const trendData = reports
      .map(report => {
        const metric = report.metrics.find(m => m.name === metricName);
        if (!metric) return null;

        return {
          date: report.reportDate,
          value: metric.value,
          unit: metric.unit,
          status: metric.status,
          referenceRange: metric.referenceRange
        };
      })
      .filter(Boolean)
      .reverse(); // Oldest to newest for chart

    res.json({
      success: true,
      data: {
        metricName,
        trend: trendData,
        latestValue: trendData[trendData.length - 1],
        change: trendData.length >= 2
          ? trendData[trendData.length - 1].value - trendData[0].value
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all available metrics (unique metric names from user's reports)
export const getAvailableMetrics = async (req, res) => {
  try {
    const userId = req.user._id;

    const reports = await HealthReport.find({ userId });

    // Extract unique metric names grouped by category
    const metricsByCategory = {};

    reports.forEach(report => {
      report.metrics.forEach(metric => {
        if (!metricsByCategory[metric.category]) {
          metricsByCategory[metric.category] = new Set();
        }
        metricsByCategory[metric.category].add(metric.name);
      });
    });

    // Convert Sets to Arrays
    const result = Object.entries(metricsByCategory).map(([category, namesSet]) => ({
      category,
      metrics: Array.from(namesSet)
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get summary of latest report with status counts
export const getLatestReportSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const report = await HealthReport.findOne({ userId })
      .sort({ reportDate: -1 });

    if (!report) {
      return res.json({
        success: true,
        data: null
      });
    }

    const statusSummary = { low: 0, normal: 0, high: 0 };
    report.metrics.forEach(metric => {
      statusSummary[metric.status]++;
    });

    res.json({
      success: true,
      data: {
        reportDate: report.reportDate,
        reportName: report.reportName,
        totalMetrics: report.metrics.length,
        statusSummary,
        daysAgo: Math.floor((Date.now() - new Date(report.reportDate).getTime()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
