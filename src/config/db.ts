import { PrismaClient } from "@prisma/client";

// Why a singleton: PrismaClient opens a connection pool. If every file
// created its own `new PrismaClient()`, we'd open dozens of pools and
// exhaust Postgres's connection limit under load. One instance, imported
// everywhere, is the correct pattern.
export const prisma = new PrismaClient();
