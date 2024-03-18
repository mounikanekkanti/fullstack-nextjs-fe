import { AppProps } from 'next/app';
import { EmployeeProvider } from '../app/common/EmployeeContext';
import '../app/globals.css';
import 'tailwindcss/tailwind.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <EmployeeProvider>
      <Component {...pageProps} />
    </EmployeeProvider>
  );
}

export default MyApp;
