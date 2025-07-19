import { 
  users, 
  accounts, 
  transactions, 
  otpCodes, 
  billPayments, 
  chequeOrders, 
  externalAccounts,
  type User, 
  type InsertUser,
  type Account,
  type InsertAccount,
  type Transaction,
  type InsertTransaction,
  type OtpCode,
  type InsertOtpCode,
  type BillPayment,
  type InsertBillPayment,
  type ChequeOrder,
  type InsertChequeOrder,
  type ExternalAccount,
  type InsertExternalAccount
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lt } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUserId(userId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(userId: number): Promise<void>;

  // Account methods
  getUserAccounts(userId: number): Promise<Account[]>;
  getAccountById(accountId: number): Promise<Account | undefined>;
  getAccountTransactions(accountId: number, limit: number, offset: number): Promise<Transaction[]>;

  // OTP methods
  createOtpCode(otpCode: InsertOtpCode): Promise<OtpCode>;
  getValidOtpCode(userId: number, code: string, purpose: string): Promise<OtpCode | undefined>;
  markOtpAsUsed(otpId: number): Promise<void>;

  // Bill payment methods
  getUserBillPayments(userId: number): Promise<BillPayment[]>;
  createBillPayment(billPayment: InsertBillPayment): Promise<BillPayment>;

  // Cheque order methods
  getUserChequeOrders(userId: number): Promise<ChequeOrder[]>;
  createChequeOrder(chequeOrder: InsertChequeOrder): Promise<ChequeOrder>;

  // External account methods
  getUserExternalAccounts(userId: number): Promise<ExternalAccount[]>;
  createExternalAccount(externalAccount: InsertExternalAccount): Promise<ExternalAccount>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUserId(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.userId, userId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserLastLogin(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userId));
  }

  async getUserAccounts(userId: number): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))
      .orderBy(accounts.accountType);
  }

  async getAccountById(accountId: number): Promise<Account | undefined> {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId));
    return account || undefined;
  }

  async getAccountTransactions(accountId: number, limit: number, offset: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.transactionDate))
      .limit(limit)
      .offset(offset);
  }

  async createOtpCode(otpCode: InsertOtpCode): Promise<OtpCode> {
    const [created] = await db
      .insert(otpCodes)
      .values(otpCode)
      .returning();
    return created;
  }

  async getValidOtpCode(userId: number, code: string, purpose: string): Promise<OtpCode | undefined> {
    const [otpRecord] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.userId, userId),
          eq(otpCodes.code, code),
          eq(otpCodes.purpose, purpose),
          eq(otpCodes.isUsed, false)
        )
      );
    
    // Check expiration in JavaScript since Drizzle date comparison is complex
    if (otpRecord && new Date() < new Date(otpRecord.expiresAt)) {
      return otpRecord;
    }
    return undefined;
  }

  async markOtpAsUsed(otpId: number): Promise<void> {
    await db
      .update(otpCodes)
      .set({ isUsed: true })
      .where(eq(otpCodes.id, otpId));
  }

  async getUserBillPayments(userId: number): Promise<BillPayment[]> {
    return await db
      .select()
      .from(billPayments)
      .where(eq(billPayments.userId, userId))
      .orderBy(desc(billPayments.createdAt));
  }

  async createBillPayment(billPayment: InsertBillPayment): Promise<BillPayment> {
    const [created] = await db
      .insert(billPayments)
      .values(billPayment)
      .returning();
    return created;
  }

  async getUserChequeOrders(userId: number): Promise<ChequeOrder[]> {
    return await db
      .select()
      .from(chequeOrders)
      .where(eq(chequeOrders.userId, userId))
      .orderBy(desc(chequeOrders.orderDate));
  }

  async createChequeOrder(chequeOrder: InsertChequeOrder): Promise<ChequeOrder> {
    const [created] = await db
      .insert(chequeOrders)
      .values(chequeOrder)
      .returning();
    return created;
  }

  async getUserExternalAccounts(userId: number): Promise<ExternalAccount[]> {
    return await db
      .select()
      .from(externalAccounts)
      .where(eq(externalAccounts.userId, userId))
      .orderBy(desc(externalAccounts.createdAt));
  }

  async createExternalAccount(externalAccount: InsertExternalAccount): Promise<ExternalAccount> {
    const [created] = await db
      .insert(externalAccounts)
      .values(externalAccount)
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
