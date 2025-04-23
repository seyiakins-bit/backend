// src/utils/db.js
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to database via Prisma!");
  } catch (error) {
    console.error("Couldn't connect to database", error);
    process.exit(1);
  }
};

module.exports = { connectDB };