const bot: string = import.meta.env.TG_BOT_URL;

export const botMsg = (msg: string) =>
  fetch(`${bot}&text=${encodeURIComponent(msg)}`).catch((err) => {
    console.error('Bot Error', err);
  });
