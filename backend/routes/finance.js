import express from 'express';
import { protect } from '../middleware/auth.js';

// Import controllers
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getNetWorth,
  getTransactions,
  getTransactionsByDate,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkCreateTransactions
} from '../controllers/financeController.js';

import {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  recalculateBudget,
  resetAllBudgets
} from '../controllers/budgetController.js';

import {
  getRecurringTransactions,
  getDueRecurring,
  getUpcomingRecurring,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  executeRecurringTransaction,
  autoExecuteRecurring
} from '../controllers/recurringController.js';

import {
  getFinancialSummary,
  getSpendingTrends,
  getCategoryBreakdown,
  getSpendingByDayOfWeek,
  getSpendingByTimeOfDay,
  getImpulseAnalysis,
  getTopMerchants,
  recalculateSummary
} from '../controllers/financeAnalyticsController.js';

import {
  getHabitFinanceCorrelation
} from '../controllers/financeCorrelationController.js';

import {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  getGoalStats
} from '../controllers/goalController.js';

import {
  createDebt,
  getDebts,
  getDebt,
  updateDebt,
  deleteDebt,
  recordPayment,
  getPayments,
  deletePayment,
  getDebtSummary,
  getDebtBreakdown,
  getPayoffProgress,
  getDebtProjection
} from '../controllers/debtController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// ============================================
// ACCOUNT ROUTES
// ============================================
router.route('/accounts')
  .get(getAccounts)
  .post(createAccount);

router.route('/accounts/:id')
  .get(getAccount)
  .put(updateAccount)
  .delete(deleteAccount);

router.get('/networth', getNetWorth);

// ============================================
// TRANSACTION ROUTES
// ============================================
router.route('/transactions')
  .get(getTransactions)
  .post(createTransaction);

router.post('/transactions/bulk', bulkCreateTransactions);

router.get('/transactions/date/:date', getTransactionsByDate);

router.route('/transactions/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

// ============================================
// BUDGET ROUTES
// ============================================
router.route('/budgets')
  .get(getBudgets)
  .post(createBudget);

router.post('/budgets/reset', resetAllBudgets);

router.route('/budgets/:id')
  .get(getBudget)
  .put(updateBudget)
  .delete(deleteBudget);

router.post('/budgets/:id/recalculate', recalculateBudget);

// ============================================
// RECURRING TRANSACTION ROUTES
// ============================================
router.route('/recurring')
  .get(getRecurringTransactions)
  .post(createRecurringTransaction);

router.get('/recurring/due', getDueRecurring);
router.get('/recurring/upcoming', getUpcomingRecurring);
router.post('/recurring/auto-execute', autoExecuteRecurring);

router.route('/recurring/:id')
  .put(updateRecurringTransaction)
  .delete(deleteRecurringTransaction);

router.post('/recurring/:id/execute', executeRecurringTransaction);

// ============================================
// ANALYTICS ROUTES
// ============================================
router.get('/analytics/summary', getFinancialSummary);
router.get('/analytics/trends', getSpendingTrends);
router.get('/analytics/categories', getCategoryBreakdown);
router.get('/analytics/day-of-week', getSpendingByDayOfWeek);
router.get('/analytics/time-of-day', getSpendingByTimeOfDay);
router.get('/analytics/impulse', getImpulseAnalysis);
router.get('/analytics/merchants', getTopMerchants);
router.post('/analytics/recalculate', recalculateSummary);

// ============================================
// CORRELATION ROUTES
// ============================================
router.get('/correlations/habits', getHabitFinanceCorrelation);

// ============================================
// GOAL ROUTES
// ============================================
router.route('/goals')
  .get(protect, getGoals)
  .post(protect, createGoal);

router.get('/goals/stats/summary', protect, getGoalStats);

router.route('/goals/:id')
  .get(protect, getGoal)
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

router.post('/goals/:id/contribute', protect, addContribution);

// ============================================
// DEBT ROUTES
// ============================================
router.route('/debts')
  .get(getDebts)
  .post(createDebt);

router.get('/debts/summary', getDebtSummary);
router.get('/debts/breakdown', getDebtBreakdown);
router.get('/debts/payoff-progress', getPayoffProgress);

router.route('/debts/:id')
  .get(getDebt)
  .put(updateDebt)
  .delete(deleteDebt);

router.get('/debts/:id/projection', getDebtProjection);

// Debt Payments
router.route('/debts/:id/payments')
  .get(getPayments)
  .post(recordPayment);

router.delete('/debts/:id/payments/:paymentId', deletePayment);

export default router;
