const dashboardService = require("../services/dashboardService");

const getDashboardData = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardData(req.user.id);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardData,
};
