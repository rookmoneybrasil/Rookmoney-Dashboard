export async function sendPasswordResetEmail(
  to:       string,
  name:     string,
  resetUrl: string,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return

  const firstName = name.split(' ')[0]
  const from      = process.env.FROM_EMAIL ?? 'Rook Money <noreply@rook.money>'

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<body style="background:#0f172a;color:#cbd5e1;font-family:system-ui,sans-serif;padding:0;margin:0;">
  <div style="max-width:480px;margin:40px auto;padding:32px;background:#1e293b;border-radius:16px;border:1px solid #334155;">
    <div style="margin-bottom:24px;">
      <span style="font-size:24px;font-weight:700;color:#f1f5f9;">Rook</span>
      <span style="font-size:13px;background:#312e81;color:#a5b4fc;padding:2px 8px;border-radius:6px;margin-left:8px;vertical-align:middle;">Segurança</span>
    </div>

    <h2 style="color:#f1f5f9;margin:0 0 8px;">Redefinir senha</h2>
    <p style="color:#94a3b8;margin:0 0 24px;">
      Olá, <strong style="color:#f1f5f9;">${firstName}</strong>. Recebemos uma solicitação para redefinir a senha da sua conta.
      Clique no botão abaixo para criar uma nova senha.
    </p>

    <a href="${resetUrl}"
      style="display:inline-block;padding:13px 28px;background:#4f46e5;color:#fff;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;">
      Redefinir minha senha →
    </a>

    <p style="margin-top:28px;color:#64748b;font-size:13px;">
      Este link expira em <strong style="color:#94a3b8;">1 hora</strong>.<br/>
      Se você não solicitou a redefinição, pode ignorar este e-mail com segurança.
    </p>

    <hr style="border:none;border-top:1px solid #334155;margin:28px 0;" />
    <p style="font-size:11px;color:#334155;word-break:break-all;">
      ${resetUrl}
    </p>
  </div>
</body>
</html>`

  await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject: 'Redefinição de senha — Rook Money',
      html,
    }),
  })
}

interface BillReminder {
  name:    string
  amount:  number
  dueDate: Date
}

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d)

export async function sendBillReminders(
  to:    string,
  name:  string,
  bills: BillReminder[],
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return

  const firstName = name.split(' ')[0]
  const count     = bills.length
  const subject   = `Lembrete: ${count} conta${count > 1 ? 's' : ''} vence${count === 1 ? '' : 'm'} em 2 dias`
  const from      = process.env.FROM_EMAIL ?? 'Rook Money <noreply@rook.money>'
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const rows = bills
    .map(
      (b) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1e293b;color:#cbd5e1;">${b.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e293b;text-align:right;color:#f1f5f9;font-weight:600;">${fmt(b.amount)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e293b;text-align:right;color:#64748b;">${fmtDate(b.dueDate)}</td>
      </tr>`,
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<body style="background:#0f172a;color:#cbd5e1;font-family:system-ui,sans-serif;padding:0;margin:0;">
  <div style="max-width:500px;margin:40px auto;padding:32px;background:#1e293b;border-radius:16px;border:1px solid #334155;">
    <div style="margin-bottom:24px;">
      <span style="font-size:24px;font-weight:700;color:#f1f5f9;">Rook</span>
      <span style="font-size:13px;background:#312e81;color:#a5b4fc;padding:2px 8px;border-radius:6px;margin-left:8px;vertical-align:middle;">Lembrete</span>
    </div>

    <h2 style="color:#f1f5f9;margin:0 0 8px;">Olá, ${firstName}.</h2>
    <p style="color:#94a3b8;margin:0 0 24px;">
      ${count === 1 ? 'Esta conta vence' : 'Estas contas vencem'} em <strong style="color:#f1f5f9;">2 dias</strong>:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;padding:0 0 8px;letter-spacing:.05em;">Conta</th>
          <th style="text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;padding:0 0 8px;letter-spacing:.05em;">Valor</th>
          <th style="text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;padding:0 0 8px;letter-spacing:.05em;">Vence</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <a href="${appUrl}/bills"
      style="display:inline-block;margin-top:28px;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">
      Ver contas a pagar →
    </a>

    <p style="margin-top:32px;font-size:12px;color:#334155;">
      Você recebe este e-mail porque tem notificações ativas no Rook Money.
    </p>
  </div>
</body>
</html>`

  await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from, to, subject, html }),
  })
}
