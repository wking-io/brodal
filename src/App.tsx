import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, naiveErrorHandler } from './app/errors';

import { Generator } from './features/generator/Generator';
import { Documentation } from './features/documentation';

function App() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={naiveErrorHandler}>
        <Generator />
        <Documentation />
      </ErrorBoundary>
    </div>
  );
}

export default App;
