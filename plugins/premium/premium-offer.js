export default {
  name: 'Premium Offer',
  intents: ['payment'],
  alias: ['beli premium', 'mau beli premium', 'order premium'],
  access: 'free',
  execute: async ({ sock, m, sender, payment }) => {
    const text = m.message?.conversation || '';
    let tier = 'basic';
    if (/ultimate|lifetime/i.test(text)) tier = 'ultimate';
    if (/pro|30 hari/i.test(text)) tier = 'pro';
    const paymentData = await payment.createPayment({ userId: sender, tierKey: tier });
    const message = `Premium ${paymentData.tier.toUpperCase()} dibuat.
Jumlah: Rp${paymentData.amount}
Order: ${paymentData.order_id}
Bayar via: ${paymentData.payment_url || paymentData.qris || paymentData.deeplink}`;
    await sock.sendMessage(m.key.remoteJid, { text: message });
  },
};
