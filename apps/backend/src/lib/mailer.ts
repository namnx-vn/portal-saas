import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const isTestMode = process.env.NODE_ENV === "test";

export async function sendInviteEmail(params: {
  to: string;
  rawToken: string;
}) {
  const inviteUrl = `${process.env.APP_BASE_URL}/auth/change-pass?token=${params.rawToken}`;

  if (isTestMode) {
    console.log(`[TEST] Invite email skipped for ${params.to}: ${inviteUrl}`);
    return;
  }

  await resend.emails.send({
    from: process.env.INVITE_FROM_EMAIL!,
    to: params.to,
    subject: "Bạn được mời tham gia Portal SaaS",
    html: `<p>Nhấn vào link sau để đặt mật khẩu và kích hoạt tài khoản (hết hạn sau 24h):</p>
            <p><a href="${inviteUrl}">${inviteUrl}</a></p>`,
  });
}

export async function sendOtpEmail(params: { to: string; otp: string }) {
  if (isTestMode) {
    console.log(`[TEST] OTP email skipped for ${params.to}: ${params.otp}`);
    return;
  }

  await resend.emails.send({
    from: process.env.INVITE_FROM_EMAIL!,
    to: params.to,
    subject: "Mã xác thực đăng nhập Portal SaaS",
    html: `<p>Mã xác thực của bạn là: <strong>${params.otp}</strong></p>
            <p>Mã có hiệu lực trong 5 phút. Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p>`,
  });
}
