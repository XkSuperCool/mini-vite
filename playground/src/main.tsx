import React from 'react'
import { createRoot } from 'react-dom/client';
import './index.css'
const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

const App = () => <div>hello 22</div>;
root.render(<App />);

// @ts-ignore
import.meta.hot.accept(() => {
  // root.render(<App />)
});