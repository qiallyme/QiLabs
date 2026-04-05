export interface AppConfig {
  apiEndpoint: string;
  region: string;
  userPoolId: string;
  userPoolClientId: string;
  identityPoolId: string;
  environment: string;
}

let config: AppConfig | null = null;

export const loadConfig = async (): Promise<AppConfig> => {
  if (config) {
    return config;
  }

  try {
    const response = await fetch(`/config.json?t=${Date.now()}`);
    const loadedConfig = await response.json();
    
    // If apiEndpoint is localhost, use proxy (empty string means use same origin)
    if (loadedConfig.apiEndpoint && loadedConfig.apiEndpoint.includes('localhost')) {
      loadedConfig.apiEndpoint = '';
    }
    
    config = loadedConfig;
    console.log('Loaded config:', config);
    return config as AppConfig;
  } catch (error) {
    console.error('Failed to load config:', error);
    
    // Fallback to environment variables for local development
    config = {
      apiEndpoint: process.env.REACT_APP_API_ENDPOINT || '',
      region: process.env.REACT_APP_REGION || 'us-east-1',
      userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || '',
      identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID || '',
      environment: process.env.REACT_APP_ENVIRONMENT || 'dev',
    };
    
    return config;
  }
};

export const getConfig = (): AppConfig => {
  if (!config) {
    // Use empty apiEndpoint to use proxy
    config = {
      apiEndpoint: '',
      region: 'us-west-1',
      userPoolId: 'mock-user-pool-id',
      userPoolClientId: 'mock-client-id',
      identityPoolId: 'mock-identity-pool-id',
      environment: 'demo',
    };
  }
  return config;
};