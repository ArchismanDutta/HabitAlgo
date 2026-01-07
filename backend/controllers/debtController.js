import Debt from '../models/Debt.js';

// ===== DEBT CRUD =====

/**
 * @desc    Create new debt
 * @route   POST /api/v1/finance/debts
 * @access  Private
 */
export const createDebt = async (req, res) => {
  try {
    const userId = req.user._id;

    const debt = await Debt.create({
      ...req.body,
      userId
    });

    res.status(201).json({
      success: true,
      data: debt
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get all debts for user
 * @route   GET /api/v1/finance/debts
 * @access  Private
 */
export const getDebts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, debtType, active } = req.query;

    const query = { userId };

    if (status) {
      query.status = status;
    }

    if (debtType) {
      query.debtType = debtType;
    }

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const debts = await Debt.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: debts.length,
      data: debts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get single debt by ID
 * @route   GET /api/v1/finance/debts/:id
 * @access  Private
 */
export const getDebt = async (req, res) => {
  try {
    const userId = req.user._id;

    const debt = await Debt.findOne({
      _id: req.params.id,
      userId
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Debt not found'
      });
    }

    res.json({
      success: true,
      data: debt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Update debt
 * @route   PUT /api/v1/finance/debts/:id
 * @access  Private
 */
export const updateDebt = async (req, res) => {
  try {
    const userId = req.user._id;

    const debt = await Debt.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Debt not found'
      });
    }

    res.json({
      success: true,
      data: debt
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Delete debt
 * @route   DELETE /api/v1/finance/debts/:id
 * @access  Private
 */
export const deleteDebt = async (req, res) => {
  try {
    const userId = req.user._id;

    const debt = await Debt.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Debt not found'
      });
    }

    res.json({
      success: true,
      message: 'Debt deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== PAYMENT TRACKING =====

/**
 * @desc    Record debt payment
 * @route   POST /api/v1/finance/debts/:id/payments
 * @access  Private
 */
export const recordPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, paymentDate, notes } = req.body;

    const debt = await Debt.findOne({
      _id: req.params.id,
      userId
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Debt not found'
      });
    }

    // Calculate interest and principal
    const monthlyRate = debt.interestRate / 12 / 100;
    const interestPaid = debt.currentBalance * monthlyRate;
    const principalPaid = amount - interestPaid;

    // Record payment
    await debt.recordPayment({
      amount,
      paymentDate,
      principalPaid,
      interestPaid,
      notes
    });

    res.json({
      success: true,
      data: debt,
      paymentDetails: {
        amount,
        principalPaid,
        interestPaid,
        remainingBalance: debt.currentBalance
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get payment history for a debt
 * @route   GET /api/v1/finance/debts/:id/payments
 * @access  Private
 */
export const getPayments = async (req, res) => {
  try {
    const userId = req.user._id;

    const debt = await Debt.findOne({
      _id: req.params.id,
      userId
    }).select('paymentsHistory debtName');

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Debt not found'
      });
    }

    res.json({
      success: true,
      data: {
        debtName: debt.debtName,
        payments: debt.paymentsHistory.sort((a, b) =>
          new Date(b.paymentDate) - new Date(a.paymentDate)
        )
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Delete a payment
 * @route   DELETE /api/v1/finance/debts/:id/payments/:paymentId
 * @access  Private
 */
export const deletePayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id, paymentId } = req.params;

    const debt = await Debt.findOne({ _id: id, userId });

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Debt not found'
      });
    }

    const payment = debt.paymentsHistory.id(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Reverse the payment
    debt.currentBalance += payment.principalPaid;
    debt.totalPaid -= payment.amount;
    debt.totalPrincipalPaid -= payment.principalPaid;
    debt.totalInterestPaid -= payment.interestPaid;

    // Remove from history
    payment.remove();

    // If debt was marked paid_off, revert to active
    if (debt.status === 'paid_off' && debt.currentBalance > 0) {
      debt.status = 'active';
    }

    await debt.save();

    res.json({
      success: true,
      message: 'Payment deleted',
      data: debt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== ANALYTICS =====

/**
 * @desc    Get debt summary for dashboard
 * @route   GET /api/v1/finance/debts/summary
 * @access  Private
 */
export const getDebtSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const summary = await Debt.calculateDebtSummary(userId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get debt breakdown by type (for pie chart)
 * @route   GET /api/v1/finance/debts/breakdown
 * @access  Private
 */
export const getDebtBreakdown = async (req, res) => {
  try {
    const userId = req.user._id;

    const breakdown = await Debt.getDebtBreakdown(userId);

    res.json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get payoff progress by type (for bar chart)
 * @route   GET /api/v1/finance/debts/payoff-progress
 * @access  Private
 */
export const getPayoffProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const progress = await Debt.getPayoffProgress(userId);

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get debt payoff projection
 * @route   GET /api/v1/finance/debts/:id/projection
 * @access  Private
 */
export const getDebtProjection = async (req, res) => {
  try {
    const userId = req.user._id;

    const debt = await Debt.findOne({
      _id: req.params.id,
      userId
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        error: 'Debt not found'
      });
    }

    const monthlyRate = debt.interestRate / 12 / 100;
    let balance = debt.currentBalance;
    const projection = [];

    // Project next 12 months
    for (let i = 1; i <= 12; i++) {
      if (balance <= 0) break;

      const interestCharge = balance * monthlyRate;
      const principalPayment = Math.min(debt.monthlyPayment - interestCharge, balance);
      balance -= principalPayment;

      projection.push({
        month: i,
        payment: debt.monthlyPayment,
        principal: principalPayment,
        interest: interestCharge,
        remainingBalance: Math.max(balance, 0)
      });
    }

    res.json({
      success: true,
      data: {
        debtName: debt.debtName,
        currentBalance: debt.currentBalance,
        monthlyPayment: debt.monthlyPayment,
        interestRate: debt.interestRate,
        estimatedPayoffMonths: debt.estimatedPayoffMonths,
        projection
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
