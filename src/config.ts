/**
 * Configuration interfaces
 */
interface firebaseConfigInterface {
  apiKey: string | undefined;
  authDomain: string | undefined;
  databaseURL: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId: string | undefined;
}

interface stripeConfigInterface {
  publicKey: string;
}

interface apiConfigInterface {
  host: string | undefined;
  embedSecret: string | undefined;
}

interface billingPlansInterface {
  [key: string]: {
    name: string;
    description: string;
    price: number;
    currency: string;
  };
}

interface appDeployment {
  publicUrl: string;
}

/**
 * Configuration implementations
 */
export const firebaseConfig: firebaseConfigInterface = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

export const alimaApiConfig: apiConfigInterface = {
  host: process.env.REACT_APP_ALIMA_API_HOST,
  embedSecret: process.env.REACT_APP_ALIMA_EMBED_SECRET,
};

export const googleAnalyticsConfig: string | undefined =
  process.env.REACT_APP_GA_MEASUREMENT_ID;

export const stripeConfig: stripeConfigInterface = {
  publicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY || "",
};

export const billingPlans: billingPlansInterface = {
  alima_comercial: {
    name: "Alima Comercial",
    description: "Plan comercial de Alima",
    price: 1200,
    currency: "MXN",
  },
  alima_pro: {
    name: "Alima Pro",
    description: "Plan profesional de Alima",
    price: 1750,
    currency: "MXN",
  },
};

export const alimaAppDeployment: appDeployment = {
  publicUrl: `${process.env.REACT_APP_PROTOCOL || "http"}://${
    process.env.REACT_APP_PUBLIC_HOST || "localhost:3000"
  }`,
};

export const alimaExternalPublicHost: string | undefined =
  process.env.REACT_APP_EXTERNAL_PUBLIC_HOST || ""

export const pwaRelease: string = 'supply-v2.5.8';
