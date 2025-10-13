const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// SQLite client (development)
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

// PostgreSQL client (production)
const postgresClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function migrateToPostgres() {
  try {
    console.log('🚀 Starting migration from SQLite to PostgreSQL...');

    // Read data from SQLite
    console.log('📖 Reading data from SQLite...');
    
    const influencers = await sqliteClient.influencer.findMany();
    const links = await sqliteClient.link.findMany();
    const clicks = await sqliteClient.click.findMany();
    const commissions = await sqliteClient.commission.findMany();
    const authTokens = await sqliteClient.authToken.findMany();
    const autoPayments = await sqliteClient.autoPayment.findMany();

    console.log(`Found ${influencers.length} influencers`);
    console.log(`Found ${links.length} links`);
    console.log(`Found ${clicks.length} clicks`);
    console.log(`Found ${commissions.length} commissions`);
    console.log(`Found ${authTokens.length} auth tokens`);
    console.log(`Found ${autoPayments.length} auto payments`);

    // Write data to PostgreSQL
    console.log('💾 Writing data to PostgreSQL...');

    // Clear existing data
    await postgresClient.autoPayment.deleteMany();
    await postgresClient.commission.deleteMany();
    await postgresClient.click.deleteMany();
    await postgresClient.link.deleteMany();
    await postgresClient.influencer.deleteMany();
    await postgresClient.authToken.deleteMany();

    // Insert influencers
    if (influencers.length > 0) {
      await postgresClient.influencer.createMany({
        data: influencers.map(influencer => ({
          ...influencer,
          tags: influencer.tags || []
        }))
      });
      console.log('✅ Influencers migrated');
    }

    // Insert auth tokens
    if (authTokens.length > 0) {
      await postgresClient.authToken.createMany({
        data: authTokens
      });
      console.log('✅ Auth tokens migrated');
    }

    // Insert links
    if (links.length > 0) {
      await postgresClient.link.createMany({
        data: links.map(link => ({
          ...link,
          tags: link.tags || []
        }))
      });
      console.log('✅ Links migrated');
    }

    // Insert clicks
    if (clicks.length > 0) {
      await postgresClient.click.createMany({
        data: clicks
      });
      console.log('✅ Clicks migrated');
    }

    // Insert commissions
    if (commissions.length > 0) {
      await postgresClient.commission.createMany({
        data: commissions
      });
      console.log('✅ Commissions migrated');
    }

    // Insert auto payments
    if (autoPayments.length > 0) {
      await postgresClient.autoPayment.createMany({
        data: autoPayments
      });
      console.log('✅ Auto payments migrated');
    }

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToPostgres()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToPostgres };
