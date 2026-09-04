const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend health check passed",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealthStatus,
};
