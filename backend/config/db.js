const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = isProduction
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Often required for managed DBs like Neon/Render
        }
      },
      logging: false,
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: './marketplace.sqlite',
      logging: false,
    });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(isProduction ? 'Postgres Connected successfully.' : 'SQLite Connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
