const getCsrfTokenFromCookie = (): string | null => {
	if (typeof document === 'undefined') return null;
	const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
	return match ? decodeURIComponent(match[1]) : null;
};

export { getCsrfTokenFromCookie };
