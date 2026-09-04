const formatResponse = (success, message, data = null) => ({
  success,
  message,
  data,
});

module.exports = {
  formatResponse,
};
