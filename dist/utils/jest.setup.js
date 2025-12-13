import sequelize from "./src/config/database.js";

beforeAll(async () => {
  // Setup Database connection for tests
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error("Test database connection failed:", error);
    throw error;
  }
});

afterAll(async () => {
  // Close Database connection
  if (sequelize) {
    try {
      await sequelize.close();
    } catch (error) {
      console.error("Error closing database:", error);
    }
  }
});
