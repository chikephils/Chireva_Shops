const Order = require("../models/order");
const Shop = require("../models/shop");

const releaseEscrowFunds = async () => {
  const now = new Date();

  const orders = await Order.find({
    status: "Shipped",
    autoReleaseAt: { $lte: now },
    fundsReleased: false,
  });

  for (const order of orders) {
    const shop = await Shop.findById(order.shop);

    if (!shop) continue;

    const sellerAmount = order.totalPrice + order.shipping;

    // credit seller
    shop.availableBalance += sellerAmount;

    shop.transactions.push({
      amount: sellerAmount,
      type: "Auto Escrow Release",
      status: "Successful",
      reference: order._id,
    });

    await shop.save({ validateBeforeSave: false });

    // update order
    order.status = "Delivered";
    order.deliveredAt = new Date();
    order.fundsReleased = true;

    await order.save({ validateBeforeSave: false });
  }

  console.log(`Escrow released for ${orders.length} orders`);
};

module.exports = { releaseEscrowFunds };
