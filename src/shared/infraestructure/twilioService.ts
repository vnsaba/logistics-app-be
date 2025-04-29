import { Twilio } from "twilio";
import { SmsSender } from "../domain/interfaces/SmsSender.interface";

export class TwilioService implements SmsSender {
    private client: Twilio

    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        this.client = new Twilio(accountSid, authToken)
    }

    async sendSMS(to: string, code: string): Promise<void> {
        const body = `¡Hola! Tu código para acceder es ${code}. Este código expirará en 5 minutos.`
        try {
            await this.client.messages.create({
                body,
                from: process.env.TWILIO_PHONE_NUMBER,
                to,
            })
            console.log("se envio el codigo", code)
        } catch (error) {
            console.error("Error al enviar SMS:", error);
            throw error;
        }
    }

}