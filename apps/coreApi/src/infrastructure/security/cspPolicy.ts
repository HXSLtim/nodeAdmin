const DEFAULT_CSP_POLICY =
  "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' ws: wss: http: https:";

const REQUIRED_DIRECTIVES = ['default-src', 'img-src', 'style-src', 'script-src', 'connect-src'];
const DISALLOWED_SCRIPT_TOKENS = new Set(['*', "'unsafe-eval'"]);

export interface CspValidationResult {
  issues: string[];
  policy: string;
  valid: boolean;
}

export function resolveCspPolicy(policy: string): CspValidationResult {
  const normalizedPolicy = policy.trim();
  const directives = normalizedPolicy
    .split(';')
    .map((directive) => directive.trim())
    .filter((directive) => directive.length > 0);

  const directivesByName = new Map<string, string[]>();
  for (const directive of directives) {
    const [name, ...values] = directive.split(/\s+/);
    directivesByName.set(name, values);
  }

  const issues: string[] = [];

  for (const directive of REQUIRED_DIRECTIVES) {
    if (!directivesByName.has(directive)) {
      issues.push(`Missing required CSP directive: ${directive}`);
    }
  }

  const scriptSrcValues = directivesByName.get('script-src') ?? [];
  for (const token of scriptSrcValues) {
    if (DISALLOWED_SCRIPT_TOKENS.has(token)) {
      issues.push(`Disallowed script-src token detected: ${token}`);
    }
  }

  if (issues.length > 0) {
    return {
      issues,
      policy: DEFAULT_CSP_POLICY,
      valid: false,
    };
  }

  return {
    issues: [],
    policy: normalizedPolicy,
    valid: true,
  };
}

export { DEFAULT_CSP_POLICY };
