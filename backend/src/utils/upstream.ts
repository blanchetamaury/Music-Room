import { ERRORS_DETAILS } from './error';
import {
	DeezerTrackNotFoundError,
	DeezerTrackNotPlayableError,
	DeezerUpstreamError,
} from '../../prisma/database/deezerFindTrack';
import { isConcurrencyConflict, isForeignKeyViolation, isRecordNotFound } from './prisma';

const mapUpstreamError = (error: unknown): Response | null => {
	if (error instanceof DeezerTrackNotFoundError) {
		return ERRORS_DETAILS.not_found('Track');
	}
	if (error instanceof DeezerTrackNotPlayableError) {
		return Response.json(
			{ success: false, message: 'This track has no playable preview in your region' },
			{ status: 422 }
		);
	}
	if (error instanceof DeezerUpstreamError) {
		return Response.json(
			{ success: false, message: 'Track provider is temporarily unavailable, please retry' },
			{ status: 502 }
		);
	}
	if (isRecordNotFound(error)) {
		return ERRORS_DETAILS.not_found();
	}
	if (isConcurrencyConflict(error)) {
		return ERRORS_DETAILS.conflict();
	}
	if (isForeignKeyViolation(error)) {
		return ERRORS_DETAILS.invalid_parameter('reference');
	}
	return null;
};

export { mapUpstreamError };
