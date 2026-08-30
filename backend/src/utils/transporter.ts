import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

export function getTransporter(): Transporter {
	if (transporter) return transporter;

	const missing = ['SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'].filter((k) => !process.env[k]);
	if (missing.length > 0) {
		throw new Error(`Configuration SMTP incomplète : ${missing.join(', ')}`);
	}

	transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
		pool: true,
		maxConnections: 3,
		maxMessages: 50,
		rateDelta: 1000,
		rateLimit: 5,
	});

	return transporter;
}

interface MailOptions {
	to: string;
	subject: string;
	text: string;
	html?: string;
}

export async function sendMail({ to, subject, text, html }: MailOptions): Promise<void> {
	const info = await getTransporter().sendMail({
		from: process.env.MAIL_FROM,
		to,
		subject,
		text,
		html,
	});

	// Log sans donnée personnelle en clair
	console.info('[mailer] sent', { messageId: info.messageId, accepted: info.accepted.length });
}
