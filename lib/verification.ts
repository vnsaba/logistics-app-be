export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const expiresAt = () => {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
};


