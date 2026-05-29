/**
 * Safe error message mapping.
 *
 * Never expose raw backend error messages to the user — they can leak
 * internal details (table names, stack traces, etc.).
 * Instead, map HTTP status codes to user-friendly Portuguese messages.
 */

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Dados inválidos. Verifique as informações e tente novamente.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito: este registro já existe.',
  422: 'Dados inválidos. Verifique os campos obrigatórios.',
  429: 'Muitas requisições. Aguarde um momento.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
  503: 'Serviço temporariamente indisponível.',
};

const DEFAULT_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.';

/**
 * Extract a safe, user-facing error message from an Axios error.
 * Falls back to a generic message if the status code is unknown.
 */
export function getSafeErrorMessage(error: unknown, fallback?: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status && ERROR_MESSAGES[status]) {
      return ERROR_MESSAGES[status];
    }
  }
  return fallback || DEFAULT_MESSAGE;
}
