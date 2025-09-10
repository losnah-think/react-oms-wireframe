import React from 'react';
import dynamic from 'next/dynamic';

// App 컴포넌트를 동적으로 import (SSR 비활성화)
const App = dynamic(() => import('../src/App'), {
  ssr: false
});

export default function Home() {
  return <App />;
}
