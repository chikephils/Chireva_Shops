const cron = require("node-cron");
const { releaseEscrowFunds } = require("../services/escrow.service");

// runs every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  try {
    console.log("Running escrow release job...");

    await releaseEscrowFunds();

    console.log("Escrow job completed");
  } catch (error) {
    console.error("Escrow cron error:", error);
  }
});
