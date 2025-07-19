import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import bcrypt from "bcrypt";
import { emailService } from "./services/email";
import { authService } from "./services/auth";
import { sessionMiddleware } from "./middleware/session";

const loginSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(1),
});

const otpVerifySchema = z.object({
  code: z.string().length(6),
  purpose: z.string(),
});

const billPaymentSchema = z.object({
  fromAccountId: z.number(),
  payeeName: z.string().min(1),
  amount: z.string().regex(/^\d+\.?\d{0,2}$/),
  accountNumber: z.string().optional(),
});

const chequeOrderSchema = z.object({
  accountId: z.number(),
  chequeStyle: z.string().min(1),
  quantity: z.number().positive(),
  startingNumber: z.number().positive(),
  deliveryAddress: z.string().min(1),
  deliveryMethod: z.string().min(1),
});

const externalAccountSchema = z.object({
  institutionName: z.string().min(1),
  accountType: z.string().min(1),
  institutionNumber: z.string().length(3),
  transitNumber: z.string().length(5),
  accountNumber: z.string().min(1),
});

declare module "express-session" {
  interface SessionData {
    userId?: number;
    pendingUserId?: number;
    isAuthenticated?: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply session middleware
  app.use(sessionMiddleware);

  // Auth middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    if (!req.session.isAuthenticated || !req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { userId, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUserId(userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate and send OTP
      const otpCode = authService.generateOTP();
      await storage.createOtpCode({
        userId: user.id,
        code: otpCode,
        purpose: "login",
        isUsed: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      await emailService.sendOTP(user.email, otpCode, user.name);

      // Store pending user in session
      req.session.pendingUserId = user.id;
      await new Promise((resolve) => req.session.save(resolve));

      res.json({ message: "OTP sent to your email", requiresOTP: true });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { code, purpose } = otpVerifySchema.parse(req.body);
      
      if (!req.session.pendingUserId && purpose === "login") {
        return res.status(400).json({ message: "No pending authentication" });
      }

      const userId = purpose === "login" ? req.session.pendingUserId : req.session.userId;
      if (!userId) {
        return res.status(400).json({ message: "Invalid session" });
      }

      const isValid = await authService.verifyOTP(userId, code, purpose);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid or expired code" });
      }

      if (purpose === "login") {
        req.session.userId = userId;
        req.session.isAuthenticated = true;
        req.session.pendingUserId = undefined;
        
        await storage.updateUserLastLogin(userId);
      }

      await new Promise((resolve) => req.session.save(resolve));
      res.json({ message: "Verification successful" });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // User routes
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Account routes
  app.get("/api/accounts", requireAuth, async (req, res) => {
    try {
      const accounts = await storage.getUserAccounts(req.session.userId!);
      res.json(accounts);
    } catch (error) {
      console.error("Get accounts error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/accounts/:id/transactions", requireAuth, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      // Verify account belongs to user
      const account = await storage.getAccountById(accountId);
      if (!account || account.userId !== req.session.userId) {
        return res.status(404).json({ message: "Account not found" });
      }

      const transactions = await storage.getAccountTransactions(accountId, limit, offset);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Bill payment routes
  app.get("/api/bill-payments", requireAuth, async (req, res) => {
    try {
      const payments = await storage.getUserBillPayments(req.session.userId!);
      res.json(payments);
    } catch (error) {
      console.error("Get bill payments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/bill-payments", requireAuth, async (req, res) => {
    try {
      const paymentData = billPaymentSchema.parse(req.body);
      
      // Verify account belongs to user
      const account = await storage.getAccountById(paymentData.fromAccountId);
      if (!account || account.userId !== req.session.userId) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Check sufficient balance
      const amount = parseFloat(paymentData.amount);
      if (parseFloat(account.balance) < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Generate and send OTP
      const user = await storage.getUser(req.session.userId!);
      const otpCode = authService.generateOTP();
      await storage.createOtpCode({
        userId: req.session.userId!,
        code: otpCode,
        purpose: "bill_payment",
        isUsed: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      await emailService.sendOTP(user!.email, otpCode, user!.name, "bill payment");

      // Create pending bill payment
      const billPayment = await storage.createBillPayment({
        userId: req.session.userId!,
        fromAccountId: paymentData.fromAccountId,
        payeeName: paymentData.payeeName,
        amount: paymentData.amount,
        accountNumber: paymentData.accountNumber,
        status: "pending",
        scheduledDate: new Date(),
      });

      res.json({ 
        message: "OTP sent for verification", 
        billPaymentId: billPayment.id,
        requiresOTP: true 
      });
    } catch (error) {
      console.error("Create bill payment error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Cheque order routes
  app.get("/api/cheque-orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getUserChequeOrders(req.session.userId!);
      res.json(orders);
    } catch (error) {
      console.error("Get cheque orders error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cheque-orders", requireAuth, async (req, res) => {
    try {
      const orderData = chequeOrderSchema.parse(req.body);
      
      // Verify account belongs to user
      const account = await storage.getAccountById(orderData.accountId);
      if (!account || account.userId !== req.session.userId) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Calculate cost
      const costs = { 50: 25, 100: 45, 200: 85 };
      const baseCost = costs[orderData.quantity as keyof typeof costs] || 45;
      let totalCost = baseCost;
      if (orderData.deliveryMethod === "express") {
        totalCost += 15;
      }

      // Generate and send OTP
      const user = await storage.getUser(req.session.userId!);
      const otpCode = authService.generateOTP();
      await storage.createOtpCode({
        userId: req.session.userId!,
        code: otpCode,
        purpose: "cheque_order",
        isUsed: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      await emailService.sendOTP(user!.email, otpCode, user!.name, "cheque order");

      // Create cheque order
      const orderNumber = `CO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const chequeOrder = await storage.createChequeOrder({
        userId: req.session.userId!,
        accountId: orderData.accountId,
        orderNumber,
        chequeStyle: orderData.chequeStyle,
        quantity: orderData.quantity,
        startingNumber: orderData.startingNumber,
        deliveryAddress: orderData.deliveryAddress,
        deliveryMethod: orderData.deliveryMethod,
        totalCost: totalCost.toString(),
        status: "pending",
      });

      res.json({ 
        message: "OTP sent for verification", 
        chequeOrderId: chequeOrder.id,
        requiresOTP: true 
      });
    } catch (error) {
      console.error("Create cheque order error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // External account routes
  app.get("/api/external-accounts", requireAuth, async (req, res) => {
    try {
      const accounts = await storage.getUserExternalAccounts(req.session.userId!);
      res.json(accounts);
    } catch (error) {
      console.error("Get external accounts error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/external-accounts", requireAuth, async (req, res) => {
    try {
      const accountData = externalAccountSchema.parse(req.body);
      
      // Generate micro deposits
      const microDeposit1 = (Math.random() * 0.99 + 0.01).toFixed(2);
      const microDeposit2 = (Math.random() * 0.99 + 0.01).toFixed(2);

      const externalAccount = await storage.createExternalAccount({
        userId: req.session.userId!,
        institutionName: accountData.institutionName,
        accountType: accountData.accountType,
        institutionNumber: accountData.institutionNumber,
        transitNumber: accountData.transitNumber,
        accountNumber: accountData.accountNumber,
        verificationStatus: "pending",
        microDeposit1,
        microDeposit2,
        verificationAttempts: 0,
      });

      // Send notification email
      const user = await storage.getUser(req.session.userId!);
      await emailService.sendExternalAccountNotification(
        user!.email,
        user!.name,
        accountData.institutionName,
        microDeposit1,
        microDeposit2
      );

      res.json({ 
        message: "External account linking initiated. Check your email for verification details.",
        externalAccountId: externalAccount.id 
      });
    } catch (error) {
      console.error("Create external account error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
