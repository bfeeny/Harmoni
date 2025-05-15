import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Custom render function that includes providers if needed
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return {
    user: userEvent.setup(),
    ...render(ui, {
      // Add any global providers here if needed
      // e.g., <ThemeProvider theme={theme}>{ui}</ThemeProvider>
      ...options,
    }),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };