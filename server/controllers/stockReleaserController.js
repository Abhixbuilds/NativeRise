const StockReservation = require('../models/StockReservation');
const { emitToUser } = require('../config/socket');

/**
 * Cron controller to release expired stock reservations.
 */
async function releaseExpiredReservations(req, res) {
  try {
    const now = new Date();
    const expired = await StockReservation.find({ expiresAt: { $lte: now } });
    for (const reservation of expired) {
      // Emit socket event to inform user (optional)
      emitToUser(reservation.userId.toString(), 'stock:reservation-expired', {
        productId: reservation.productId,
        reservationId: reservation._id,
      });
      // Delete reservation
      await reservation.remove();
    }
    res.status(200).json({ success: true, data: { releasedCount: expired.length } });
  } catch (err) {
    console.error('Error releasing stock reservations', err);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
}

module.exports = { releaseExpiredReservations };
