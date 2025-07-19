import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 20 }).notNull().unique(), // Banking user ID like 1972000
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  password: text("password").notNull(),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountNumber: varchar("account_number", { length: 20 }).notNull().unique(),
  accountType: varchar("account_type", { length: 50 }).notNull(), // chequing, savings, tfsa, term_deposit
  accountName: varchar("account_name", { length: 100 }).notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  currency: varchar("currency", { length: 3 }).notNull().default("CAD"),
  isActive: boolean("is_active").default(true),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  maturityDate: timestamp("maturity_date"), // For term deposits
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(), // debit, credit, transfer
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }),
  referenceNumber: varchar("reference_number", { length: 50 }),
  balanceAfter: decimal("balance_after", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("completed"), // pending, completed, failed
  transactionDate: timestamp("transaction_date").defaultNow(),
});

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  purpose: varchar("purpose", { length: 50 }).notNull(), // login, bill_payment, cheque_order, external_verification
  isUsed: boolean("is_used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const billPayments = pgTable("bill_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fromAccountId: integer("from_account_id").references(() => accounts.id).notNull(),
  payeeName: varchar("payee_name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  accountNumber: varchar("account_number", { length: 50 }),
  referenceNumber: varchar("reference_number", { length: 50 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, completed, failed
  scheduledDate: timestamp("scheduled_date"),
  processedDate: timestamp("processed_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chequeOrders = pgTable("cheque_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  chequeStyle: varchar("cheque_style", { length: 50 }).notNull(),
  quantity: integer("quantity").notNull(),
  startingNumber: integer("starting_number").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryMethod: varchar("delivery_method", { length: 50 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, processing, shipped, delivered
  orderDate: timestamp("order_date").defaultNow(),
  shippedDate: timestamp("shipped_date"),
  deliveredDate: timestamp("delivered_date"),
});

export const externalAccounts = pgTable("external_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  institutionName: varchar("institution_name", { length: 255 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(),
  institutionNumber: varchar("institution_number", { length: 3 }).notNull(),
  transitNumber: varchar("transit_number", { length: 5 }).notNull(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  accountNickname: varchar("account_nickname", { length: 100 }),
  verificationStatus: varchar("verification_status", { length: 20 }).notNull().default("pending"), // pending, verified, failed
  microDeposit1: decimal("micro_deposit_1", { precision: 4, scale: 2 }),
  microDeposit2: decimal("micro_deposit_2", { precision: 4, scale: 2 }),
  verificationAttempts: integer("verification_attempts").default(0),
  linkedDate: timestamp("linked_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  transactions: many(transactions, { relationName: "userTransactions" }),
  otpCodes: many(otpCodes),
  billPayments: many(billPayments),
  chequeOrders: many(chequeOrders),
  externalAccounts: many(externalAccounts),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  billPayments: many(billPayments),
  chequeOrders: many(chequeOrders),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
}));

export const otpCodesRelations = relations(otpCodes, ({ one }) => ({
  user: one(users, {
    fields: [otpCodes.userId],
    references: [users.id],
  }),
}));

export const billPaymentsRelations = relations(billPayments, ({ one }) => ({
  user: one(users, {
    fields: [billPayments.userId],
    references: [users.id],
  }),
  fromAccount: one(accounts, {
    fields: [billPayments.fromAccountId],
    references: [accounts.id],
  }),
}));

export const chequeOrdersRelations = relations(chequeOrders, ({ one }) => ({
  user: one(users, {
    fields: [chequeOrders.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [chequeOrders.accountId],
    references: [accounts.id],
  }),
}));

export const externalAccountsRelations = relations(externalAccounts, ({ one }) => ({
  user: one(users, {
    fields: [externalAccounts.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  transactionDate: true,
});

export const insertOtpCodeSchema = createInsertSchema(otpCodes).omit({
  id: true,
  createdAt: true,
});

export const insertBillPaymentSchema = createInsertSchema(billPayments).omit({
  id: true,
  createdAt: true,
});

export const insertChequeOrderSchema = createInsertSchema(chequeOrders).omit({
  id: true,
  orderDate: true,
});

export const insertExternalAccountSchema = createInsertSchema(externalAccounts).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtpCode = z.infer<typeof insertOtpCodeSchema>;
export type BillPayment = typeof billPayments.$inferSelect;
export type InsertBillPayment = z.infer<typeof insertBillPaymentSchema>;
export type ChequeOrder = typeof chequeOrders.$inferSelect;
export type InsertChequeOrder = z.infer<typeof insertChequeOrderSchema>;
export type ExternalAccount = typeof externalAccounts.$inferSelect;
export type InsertExternalAccount = z.infer<typeof insertExternalAccountSchema>;
