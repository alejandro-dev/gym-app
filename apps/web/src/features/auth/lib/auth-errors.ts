import { ErrorCode } from "@/services/errors/ErrorCode";

export type StatusMessageMap = Partial<Record<number, string>>;

export function getStatusErrorMessage(error: unknown, messages: StatusMessageMap, fallback = "Unexpected error") {
	if (error instanceof ErrorCode) {
		return messages[error.status] ?? error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return fallback;
}
