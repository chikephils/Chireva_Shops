const Shop = require("../model/shop");
const AdminBalance = require("../model/admin");

const releaseFundsToSeller = async (order) => {
  if (!order) throw new Error("Order not provided");
  if (order.fundsReleased) return;

  const shop = await Shop.findById(order.shop);
  if (!shop) throw new Error("Shop not found");

  const admin = await AdminBalance.findOne();
  if (!admin) throw new Error("Admin balance not found");

  const sellerAmount = order.totalPrice;

  //  debit escrow properly
  admin.escrowBalance = Math.max(0, admin.escrowBalance - sellerAmount);

  // credit seller
  shop.availableBalance += sellerAmount;

  // mark released
  order.fundsReleased = true;

  // transaction log
  shop.transactions.push({
    amount: sellerAmount,
    type: "Purchase",
    status: "Successful",
    reference: order._id,
  });

  await admin.save({ validateBeforeSave: false });
  await shop.save({ validateBeforeSave: false });
  await order.save({ validateBeforeSave: false });
};

module.exports = {
  releaseFundsToSeller,
};
