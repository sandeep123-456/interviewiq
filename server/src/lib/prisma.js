// Poore app ke liye ek hi Prisma client.
// Har file me naya PrismaClient() mat banana, warna database connections khatam ho jate hain.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;