export async function getDashboard(req, res) {
  res.json({
    success: true,
    data: {
      message: 'Welcome to Ascendra',
      user: req.user.toPublicJSON(),
    },
  })
}
