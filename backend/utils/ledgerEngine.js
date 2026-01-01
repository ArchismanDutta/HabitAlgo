import LedgerEntry from '../models/LedgerEntry.js';
import FinancialAccount from '../models/FinancialAccount.js';
import mongoose from 'mongoose';

/**
 * Ledger Engine - Handles double-entry bookkeeping logic
 *
 * Every financial transaction must maintain the fundamental accounting equation:
 * Assets = Liabilities + Equity
 *
 * Rules:
 * 1. Every transaction has at least 2 ledger entries (debit and credit)
 * 2. Total debits must equal total credits
 * 3. Account balances are computed from ledger entries, never stored directly
 */

class LedgerEngine {
  /**
   * Create ledger entries for a transaction
   * @param {Object} transaction - FinancialTransaction document
   * @returns {Array} Array of created ledger entries
   */
  static async createEntriesForTransaction(transaction) {
    const entries = [];
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      switch (transaction.type) {
        case 'expense':
          entries.push(...await this.createExpenseEntries(transaction, session));
          break;
        case 'income':
          entries.push(...await this.createIncomeEntries(transaction, session));
          break;
        case 'transfer':
          entries.push(...await this.createTransferEntries(transaction, session));
          break;
        case 'credit_card_payment':
          entries.push(...await this.createCreditCardPaymentEntries(transaction, session));
          break;
        case 'loan_payment':
          entries.push(...await this.createLoanPaymentEntries(transaction, session));
          break;
        case 'investment':
          entries.push(...await this.createInvestmentEntries(transaction, session));
          break;
        case 'withdrawal':
        case 'deposit':
          entries.push(...await this.createCashTransactionEntries(transaction, session));
          break;
        default:
          throw new Error(`Unknown transaction type: ${transaction.type}`);
      }

      // Verify double-entry integrity
      const totalDebits = entries.filter(e => e.entryType === 'debit')
        .reduce((sum, e) => sum + e.amount, 0);
      const totalCredits = entries.filter(e => e.entryType === 'credit')
        .reduce((sum, e) => sum + e.amount, 0);

      const diff = Math.abs(totalDebits - totalCredits);
      if (diff > 0.01) {
        throw new Error(`Double-entry violation: debits (${totalDebits}) != credits (${totalCredits})`);
      }

      // Update account balances
      await this.updateAccountBalances(entries, session);

      await session.commitTransaction();
      return entries;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Create entries for expense transaction
   * Debit: Expense category (virtual account)
   * Credit: Bank/Cash account (asset decreases)
   */
  static async createExpenseEntries(transaction, session) {
    const entries = [];

    // Debit expense category
    entries.push(await LedgerEntry.create([{
      userId: transaction.userId,
      transactionId: transaction._id,
      date: transaction.date,
      accountId: null, // Virtual account (expense category)
      entryType: 'debit',
      amount: transaction.amount,
      category: transaction.category,
      subcategory: transaction.subcategory,
      description: transaction.description,
      merchant: transaction.merchant,
      tags: transaction.tags
    }], { session }));

    // Credit source account
    entries.push(await LedgerEntry.create([{
      userId: transaction.userId,
      transactionId: transaction._id,
      date: transaction.date,
      accountId: transaction.accountId,
      entryType: 'credit',
      amount: transaction.amount,
      description: transaction.description,
      merchant: transaction.merchant,
      tags: transaction.tags
    }], { session }));

    return entries.flat();
  }

  /**
   * Create entries for income transaction
   * Debit: Bank/Cash account (asset increases)
   * Credit: Income category (virtual account)
   */
  static async createIncomeEntries(transaction, session) {
    const entries = [];

    // Debit destination account
    entries.push(await LedgerEntry.create([{
      userId: transaction.userId,
      transactionId: transaction._id,
      date: transaction.date,
      accountId: transaction.accountId,
      entryType: 'debit',
      amount: transaction.amount,
      description: transaction.description,
      tags: transaction.tags
    }], { session }));

    // Credit income category
    entries.push(await LedgerEntry.create([{
      userId: transaction.userId,
      transactionId: transaction._id,
      date: transaction.date,
      accountId: null, // Virtual account (income category)
      entryType: 'credit',
      amount: transaction.amount,
      category: transaction.category,
      subcategory: transaction.subcategory,
      description: transaction.description,
      tags: transaction.tags
    }], { session }));

    return entries.flat();
  }

  /**
   * Create entries for transfer between accounts
   * Debit: Destination account (asset increases)
   * Credit: Source account (asset decreases)
   */
  static async createTransferEntries(transaction, session) {
    const entries = [];

    if (!transaction.toAccountId) {
      throw new Error('Transfer requires toAccountId');
    }

    // Debit destination account
    entries.push(await LedgerEntry.create([{
      userId: transaction.userId,
      transactionId: transaction._id,
      date: transaction.date,
      accountId: transaction.toAccountId,
      entryType: 'debit',
      amount: transaction.amount,
      description: transaction.description || 'Transfer in',
      tags: transaction.tags
    }], { session }));

    // Credit source account
    entries.push(await LedgerEntry.create([{
      userId: transaction.userId,
      transactionId: transaction._id,
      date: transaction.date,
      accountId: transaction.accountId,
      entryType: 'credit',
      amount: transaction.amount,
      description: transaction.description || 'Transfer out',
      tags: transaction.tags
    }], { session }));

    return entries.flat();
  }

  /**
   * Create entries for credit card payment
   * Debit: Credit Card (liability decreases)
   * Credit: Bank account (asset decreases)
   */
  static async createCreditCardPaymentEntries(transaction, session) {
    const entries = [];

    if (!transaction.toAccountId) {
      throw new Error('Credit card payment requires toAccountId (credit card account)');
    }

    // Debit credit card (reduces liability)
    entries.push(await LedgerEntry.create([{
      userId: transaction.userId,
      transactionId: transaction._id,
      date: transaction.date,
      accountId: transaction.toAccountId,
      entryType: 'debit',
      amount: transaction.amount,
      description: transaction.description || 'Credit card payment',
      tags: transaction.tags
    }], { session }));

    // Credit bank account
    entries.push(await LedgerEntry.create([{
      userId: transaction.userId,
      transactionId: transaction._id,
      date: transaction.date,
      accountId: transaction.accountId,
      entryType: 'credit',
      amount: transaction.amount,
      description: transaction.description || 'Credit card payment',
      tags: transaction.tags
    }], { session }));

    return entries.flat();
  }

  /**
   * Create entries for loan payment (EMI)
   * Similar to credit card payment
   */
  static async createLoanPaymentEntries(transaction, session) {
    const entries = [];

    if (!transaction.toAccountId) {
      throw new Error('Loan payment requires toAccountId (loan account)');
    }

    // Debit loan account (reduces liability)
    entries.push(await LedgerEntry.create([{
      userId: transaction.userId,
      transactionId: transaction._id,
      date: transaction.date,
      accountId: transaction.toAccountId,
      entryType: 'debit',
      amount: transaction.amount,
      description: transaction.description || 'Loan payment',
      tags: transaction.tags
    }], { session }));

    // Credit bank account
    entries.push(await LedgerEntry.create([{
      userId: transaction.userId,
      transactionId: transaction._id,
      date: transaction.date,
      accountId: transaction.accountId,
      entryType: 'credit',
      amount: transaction.amount,
      description: transaction.description || 'Loan payment',
      tags: transaction.tags
    }], { session }));

    return entries.flat();
  }

  /**
   * Create entries for investment (SIP, mutual fund purchase)
   * Debit: Investment account (asset increases)
   * Credit: Bank account (asset decreases)
   */
  static async createInvestmentEntries(transaction, session) {
    const entries = [];

    if (!transaction.toAccountId) {
      throw new Error('Investment requires toAccountId (investment account)');
    }

    // Debit investment account
    entries.push(await LedgerEntry.create([{
      userId: transaction.userId,
      transactionId: transaction._id,
      date: transaction.date,
      accountId: transaction.toAccountId,
      entryType: 'debit',
      amount: transaction.amount,
      description: transaction.description || 'Investment',
      category: transaction.category,
      tags: transaction.tags
    }], { session }));

    // Credit bank account
    entries.push(await LedgerEntry.create([{
      userId: transaction.userId,
      transactionId: transaction._id,
      date: transaction.date,
      accountId: transaction.accountId,
      entryType: 'credit',
      amount: transaction.amount,
      description: transaction.description || 'Investment',
      tags: transaction.tags
    }], { session }));

    return entries.flat();
  }

  /**
   * Create entries for cash withdrawal/deposit
   */
  static async createCashTransactionEntries(transaction, session) {
    if (transaction.type === 'withdrawal') {
      // Withdraw cash from bank
      return this.createTransferEntries(transaction, session);
    } else {
      // Deposit cash to bank
      return this.createTransferEntries(transaction, session);
    }
  }

  /**
   * Update account balances based on ledger entries
   */
  static async updateAccountBalances(entries, session) {
    const accountUpdates = new Map();

    // Group entries by account
    for (const entry of entries) {
      if (!entry.accountId) continue; // Skip virtual accounts

      if (!accountUpdates.has(entry.accountId.toString())) {
        accountUpdates.set(entry.accountId.toString(), 0);
      }

      const currentDelta = accountUpdates.get(entry.accountId.toString());
      const delta = entry.entryType === 'debit' ? entry.amount : -entry.amount;
      accountUpdates.set(entry.accountId.toString(), currentDelta + delta);
    }

    // Update each account's balance
    for (const [accountIdStr, delta] of accountUpdates.entries()) {
      const account = await FinancialAccount.findById(accountIdStr).session(session);
      if (account) {
        account.currentBalance += delta;
        account.lastTransactionDate = entries[0].date;
        await account.save({ session });
      }
    }
  }

  /**
   * Delete ledger entries for a transaction and update balances
   */
  static async deleteEntriesForTransaction(transactionId) {
    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      // Get entries
      const entries = await LedgerEntry.find({ transactionId }).session(session);

      if (entries.length === 0) {
        await session.commitTransaction();
        return;
      }

      // Reverse the balance updates
      const reverseEntries = entries.map(e => ({
        ...e.toObject(),
        amount: e.amount,
        entryType: e.entryType === 'debit' ? 'credit' : 'debit' // Reverse
      }));

      await this.updateAccountBalances(reverseEntries, session);

      // Delete entries
      await LedgerEntry.deleteMany({ transactionId }).session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Recalculate account balance from ledger (for audit/correction)
   */
  static async recalculateAccountBalance(accountId) {
    const balance = await LedgerEntry.calculateAccountBalance(accountId);

    const account = await FinancialAccount.findById(accountId);
    if (account) {
      account.currentBalance = balance;
      await account.save();
      return balance;
    }

    return null;
  }

  /**
   * Verify ledger integrity for a user
   */
  static async verifyLedgerIntegrity(userId) {
    const errors = [];

    // Get all transactions
    const FinancialTransaction = mongoose.model('FinancialTransaction');
    const transactions = await FinancialTransaction.find({ userId, isDeleted: false });

    for (const transaction of transactions) {
      const isValid = await LedgerEntry.verifyDoubleEntry(transaction._id);
      if (!isValid) {
        errors.push({
          transactionId: transaction._id,
          date: transaction.date,
          amount: transaction.amount,
          type: transaction.type,
          error: 'Double-entry violation'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      totalTransactions: transactions.length,
      validTransactions: transactions.length - errors.length
    };
  }
}

export default LedgerEngine;
