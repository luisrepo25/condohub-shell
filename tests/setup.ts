import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Sin `globals`, Testing Library no limpia el DOM solo entre tests.
afterEach(() => cleanup());
