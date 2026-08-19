const ERRORS_DETAILS: Record<string, (...args: string[]) => Response> = {
	internal_error: () => Response.json({ success: false, message: 'Internal server error' }, { status: 501 }),
	invalid_oauth_error: () => Response.json({ success: false, message: 'Invalid code' }, { status: 401 }),
	session_expired: () => Response.json({ success: false, message: 'This session expired.' }, { status: 401 }),
	already_exist: () => Response.json({ success: false, message: 'Is already exist' }, { status: 401 }),

	invalid_mail_password: () =>
		Response.json({ success: false, message: 'Invalid password or mail' }, { status: 401 }),

	invalid_body: () => Response.json({ success: false, message: 'Invalid body' }, { status: 400 }),
	missing_parameter: () => Response.json({ success: false, message: 'Missing parameter' }, { status: 400 }),
	invalid_parameter: () => Response.json({ success: false, message: 'Invalid parameter' }, { status: 400 }),
	unsupported_content_type: () =>
		Response.json({ success: false, message: 'Unsupported content type' }, { status: 400 }),

	account_exist_with_mail: () =>
		Response.json({ success: false, message: 'Account exist with this mail' }, { status: 400 }),
	account_unsupported_action: () =>
		Response.json({ success: false, message: 'Account unsupported action' }, { status: 403 }),

	permission_denied: () => Response.json({ success: false, message: 'Permission denied' }, { status: 403 }),

	category_does_not_exists: () =>
		Response.json({ success: false, message: 'Category does not exist' }, { status: 403 }),

	too_many_attempts: () =>
		Response.json({ success: false, message: 'Too many attempts, please try again later' }, { status: 429 }),
	two_factor_auth_required: () =>
		Response.json({ success: false, message: 'Two-factor authentication required' }, { status: 403 }),
};

const errorHandler = async (fn: () => Promise<Response>): Promise<Response> => {
	try {
		return await fn();
	} catch (error: unknown) {
		if (error instanceof Response) return error;
		console.error(error);
		return ERRORS_DETAILS.internal_error();
	}
};

export { ERRORS_DETAILS, errorHandler };
