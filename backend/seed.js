require('dotenv').config();
const { connectDB, disconnectDB } = require('./config/db');
const seedInitialData = require('./utils/seedData');

const runSeed = async () => {
  try {
    await connectDB();
    await seedInitialData();
    console.log('[Seed] Standalone seeding completed.');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Standalone seeding failed:', err);
    process.exit(1);
  }
};

runSeed();
