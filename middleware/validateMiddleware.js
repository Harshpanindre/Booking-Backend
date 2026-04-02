module.exports = (requiredFields) => {
  return (req, res, next) => {
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    next();
  };
};