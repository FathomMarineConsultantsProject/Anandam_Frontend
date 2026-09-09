import { apiRequest } from "./client";

export async function sendForgotPasswordCode(email) {
  return apiRequest("/auth/forgot-password/send-code", {
    method: "POST",
    body: JSON.stringify({ email: String(email || "").trim() }),
  });
}

export async function verifyForgotPasswordCode({ email, code }) {
  return apiRequest("/auth/forgot-password/verify-code", {
    method: "POST",
    body: JSON.stringify({
      email: String(email || "").trim(),
      code: String(code || "").trim(),
    }),
  });
}

export async function resetForgotPassword({ resetToken, newPassword, confirmPassword }) {
  return apiRequest("/auth/forgot-password/reset", {
    method: "POST",
    body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
  });
}


// the flow is
// - send mail with verification code
// - verify code
// - reset password with reset token

