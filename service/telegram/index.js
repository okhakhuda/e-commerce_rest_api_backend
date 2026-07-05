const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

const buildMessage = order => {
  const items = order.products
    .map(
      item =>
        `🖼️ [Фото](${item.image})\n` +
        `*Назва:* ${item.name}\n` +
        `*ID:* ${item.productId}\n` +
        `*Розмір:* ${item.size}\n` +
        `*Колір:* ${item.color}\n` +
        `*Кількість:* ${item.quantity} шт.\n` +
        `*Ціна:* ${item.price} грн.\n`,
    )
    .join('\n');

  return (
    `🛒 *Нове замовлення* 🛒\n\n` +
    `📋 *Номер:* ${order.orderNumber}\n\n` +
    `📦 *Товари:*\n\n${items}\n` +
    `*Клієнт:*\n` +
    `👤 *Ім'я:* ${order.user.firstName}\n` +
    `👤 *Прізвище:* ${order.user.lastName}\n` +
    `📞 *Телефон:* ${order.user.phone}\n\n` +
    `🏠 *Адреса доставки:*\n` +
    `🚚 *Постачальник:* ${order.address.provider}\n` +
    `🏙️ *Місто:* ${order.address.city}\n` +
    `🌍 *Область:* ${order.address.region}\n` +
    `📦 *Відділення:* ${order.address.department}\n\n` +
    `💰 *Сума:* ${order.totalPrice} грн.`
  );
};

export const sendTelegramNotification = async order => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram credentials not set — skipping notification');
    return;
  }

  const response = await fetch(TELEGRAM_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildMessage(order),
      parse_mode: 'Markdown',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API error ${response.status}: ${body}`);
  }
};
