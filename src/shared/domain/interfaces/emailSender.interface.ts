export interface EmailSenderInterface {
    sendEmail({ to, subject, template, context }: {
        to: string;
        subject: string;
        template: string;
        context: Record<string, unknown>;
    }
    ): Promise<void>;
}

