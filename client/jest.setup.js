import '@testing-library/jest-dom';

jest.mock('./lib/firebase', () => ({ auth: {}, firestore: {}, storage: {} }));
jest.mock('next/router', () => ({ useRouter: jest.fn(() => ({ push: jest.fn(), pathname: '/', query: {}, asPath: '/' })) }));