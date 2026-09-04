require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const User = require("./models/User");
const { seedDemoData } = require("./scripts/seedDemo");

const PORT = process.env.PORT || 8000;

const shouldSeedDemoData = async () => {
  const isDemoMode = process.env.DEMO_MODE === "true";
  const userCount = await User.countDocuments();
  return isDemoMode || userCount === 0;
};

const startServer = async () => {
  await connectDB();

  if (await shouldSeedDemoData()) {
    const demoInfo = await seedDemoData();
    console.log(
      `Demo mode enabled: ${demoInfo.users} users, ${demoInfo.resources} resources seeded`,
    );
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Kill stale Node processes with: lsof -ti :${PORT} | xargs kill -9`,
      );
      process.exit(1);
    }

    console.error("Server error:", error);
    process.exit(1);
  });
};

startServer();
