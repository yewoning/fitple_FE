export type DataMode = 'api-first' | 'mock-only' | 'api-only';
export type DemoUserRole = 'owner' | 'applicant';

function parseDataMode(value: string | undefined): DataMode {
  if (value === 'mock-only' || value === 'api-only') {
    return value;
  }

  return 'api-first';
}

function parseDemoUserRole(value: string | undefined): DemoUserRole {
  return value === 'applicant' ? 'applicant' : 'owner';
}

export const DATA_MODE = parseDataMode(process.env.EXPO_PUBLIC_DATA_MODE);
export const DEMO_USER_ROLE = parseDemoUserRole(process.env.EXPO_PUBLIC_DEMO_USER_ROLE);
