export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const expiresAt = () => {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
}