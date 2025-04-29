

export interface SmsSender {
    sendSMS (to: string, code: string): Promise<void>
}