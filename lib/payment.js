import midtransClient from 'midtrans-client';
import qrcode from 'qrcode';
import config from '../config.js';
import db from './database.js';

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: config.midtransServerKey,
  clientKey: config.midtransClientKey,
});

const tiers = {
  basic: { name: '7 Days', amount: 10000 },
  pro: { name: '30 Days', amount: 25000 },
  ultimate: { name: 'Lifetime', amount: 50000 },
};

const createPayment = async ({ userId, tierKey, paymentType = 'qris' }) => {
  const tier = tiers[tierKey.toLowerCase()];
  if (!tier) throw new Error('Tier tidak valid');
  const orderId = `TROXZY-${tierKey.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const transactionParams = {
    transaction_details: {
      order_id: orderId,
      gross_amount: tier.amount,
    },
    item_details: [{ id: tierKey, price: tier.amount, quantity: 1, name: `Premium ${tier.name}` }],
    customer_details: { first_name: userId, email: `${userId}@troxzymd.local` },
    enabled_payments: ['qris', 'gopay', 'shopeepay', 'bca_va', 'bni_va', 'permata_va'],
  };
  const charge = await snap.createTransaction(transactionParams);
  const response = {
    order_id: orderId,
    user_id: userId,
    tier: tierKey,
    amount: tier.amount,
    status: 'pending',
    payment_url: charge.redirect_url || charge.actions?.find((a) => a.name === 'generate-qr-code')?.url || '',
    qris: charge.actions?.find((a) => a.name === 'generate-qr-code')?.url || charge.redirect_url || '',
    va_numbers: charge.va_numbers || [],
    deeplink: charge.actions?.find((a) => a.name === 'deeplink-qr')?.url || '',
  };
  db.savePayment(response);
  return response;
};

const midtransWebhookHandler = async (req, res) => {
  const payload = req.body;
  if (!payload.order_id) return res.status(400).json({ success: false, message: 'Missing order_id' });
  const payment = db.getPayment(payload.order_id);
  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
  if (payload.transaction_status === 'settlement' || payload.transaction_status === 'capture') {
    const tier = payment.tier;
    const duration = tier === 'basic' ? 7 : tier === 'pro' ? 30 : 3650;
    const premiumExpiry = tier === 'ultimate' ? 0 : Date.now() + duration * 24 * 60 * 60 * 1000;
    db.setUserLevel(payment.user_id, 'premium');
    db.setPremiumExpiry(payment.user_id, premiumExpiry);
    db.savePayment({ ...payment, status: 'settlement' });
    await db.incrementStat('premiumUsers', 1);
    return res.json({ success: true });
  }
  db.savePayment({ ...payment, status: payload.transaction_status });
  return res.json({ success: true });
};

export default {
  createPayment,
  tiers,
  midtransWebhookHandler,
};
