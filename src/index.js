import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Remove or comment out this line: import './styles/tailwind.css';
// import './styles/tailwind.css'; // Removed or commented

// Import ChakraProvider
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
// Import your Auth Context (keep this)
import { AuthContextProvider } from './contexts/AuthContext';
const theme = extendTheme({});
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Wrap your app with ChakraProvider */}
    <ChakraProvider>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </ChakraProvider>
  </React.StrictMode>
);
