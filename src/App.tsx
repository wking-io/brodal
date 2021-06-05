import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, naiveErrorHandler } from './app/errors';

import { Generator } from './features/generator/Generator';
import './App.css';

function App() {
  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={naiveErrorHandler}>
        <Generator />
      </ErrorBoundary>
    </>
  );
}

export default App;
