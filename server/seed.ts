import { db } from "./db";
import { users, accounts, transactions } from "@shared/schema";
import bcrypt from "bcrypt";

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Create users
    const hashedPassword1 = await bcrypt.hash("Mate@200", 10);
    const hashedPassword2 = await bcrypt.hash("Mate@200", 10);

    const user1 = await db
      .insert(users)
      .values({
        userId: "1972000",
        email: "anncola401@gmail.com",
        name: "Mate Smith",
        password: hashedPassword1,
        isActive: true,
      })
      .returning()
      .onConflictDoNothing();

    const user2 = await db
      .insert(users)
      .values({
        userId: "197200",
        email: "rebeccamonroe886@gmail.com",
        name: "Martha Hodge",
        password: hashedPassword2,
        isActive: true,
      })
      .returning()
      .onConflictDoNothing();

    console.log("Users created");

    // Create accounts for user 1
    const user1Accounts = await db
      .insert(accounts)
      .values([
        {
          userId: user1[0]?.id || 1,
          accountNumber: "123456789",
          accountType: "chequing",
          accountName: "Personal Chequing",
          balance: "1000809.00",
          currency: "CAD",
        },
        {
          userId: user1[0]?.id || 1,
          accountNumber: "123456790",
          accountType: "savings",
          accountName: "High Interest Savings",
          balance: "1275432.50",
          currency: "CAD",
          interestRate: "2.85",
        },
        {
          userId: user1[0]?.id || 1,
          accountNumber: "123456791",
          accountType: "tfsa",
          accountName: "TFSA Savings",
          balance: "1158932.17",
          currency: "CAD",
          interestRate: "3.25",
        },
        {
          userId: user1[0]?.id || 1,
          accountNumber: "123456792",
          accountType: "term_deposit",
          accountName: "12-Month GIC",
          balance: "2525000.00",
          currency: "CAD",
          interestRate: "4.50",
          maturityDate: new Date("2025-12-01"),
        },
      ])
      .returning()
      .onConflictDoNothing();

    // Create accounts for user 2
    const user2Accounts = await db
      .insert(accounts)
      .values([
        {
          userId: user2[0]?.id || 2,
          accountNumber: "987654321",
          accountType: "chequing",
          accountName: "Personal Chequing",
          balance: "1001832.45",
          currency: "CAD",
        },
        {
          userId: user2[0]?.id || 2,
          accountNumber: "987654322",
          accountType: "savings",
          accountName: "High Interest Savings",
          balance: "1159876.32",
          currency: "CAD",
          interestRate: "2.85",
        },
      ])
      .returning()
      .onConflictDoNothing();

    console.log("Accounts created");

    // Create sample transactions for user 1's chequing account
    const chequingAccount = user1Accounts.find(acc => acc.accountType === "chequing");
    
    if (chequingAccount) {
      await db
        .insert(transactions)
        .values([
          {
            accountId: chequingAccount.id,
            transactionType: "debit",
            amount: "-45.67",
            description: "Grocery Store Purchase",
            category: "Groceries",
            referenceNumber: "TXN-001",
            balanceAfter: "2547.83",
            status: "completed",
            transactionDate: new Date("2025-01-18"),
          },
          {
            accountId: chequingAccount.id,
            transactionType: "debit",
            amount: "-127.50",
            description: "Halifax Power Bill Payment",
            category: "Utilities",
            referenceNumber: "TXN-002",
            balanceAfter: "2593.50",
            status: "completed",
            transactionDate: new Date("2025-01-17"),
          },
          {
            accountId: chequingAccount.id,
            transactionType: "credit",
            amount: "2721.00",
            description: "Salary Deposit",
            category: "Income",
            referenceNumber: "TXN-003",
            balanceAfter: "2721.00",
            status: "completed",
            transactionDate: new Date("2025-01-15"),
          },
          {
            accountId: chequingAccount.id,
            transactionType: "debit",
            amount: "-89.99",
            description: "Rogers Communications",
            category: "Utilities",
            referenceNumber: "TXN-004",
            balanceAfter: "2631.01",
            status: "completed",
            transactionDate: new Date("2025-01-14"),
          },
          {
            accountId: chequingAccount.id,
            transactionType: "debit",
            amount: "-67.23",
            description: "Halifax Water Bill",
            category: "Utilities",
            referenceNumber: "TXN-005",
            balanceAfter: "2698.24",
            status: "completed",
            transactionDate: new Date("2025-01-13"),
          },
        ])
        .onConflictDoNothing();
    }

    console.log("Sample transactions created");
    console.log("Database seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run the seeding function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Seeding finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };