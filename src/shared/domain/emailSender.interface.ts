export interface EmailSenderInterface {
    sendWelcomEmail(email: string, text: string): Promise<void>;
    sendResetPasswordLink(email:string, token:string): Promise<void>;
}
