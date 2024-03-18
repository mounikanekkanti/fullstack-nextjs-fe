import { useRouter } from "next/router";
import { useEffect } from 'react';
 
const IndexPage = () => {
  const router = useRouter();
 
  useEffect(() => {
    router.push('/login');
  }, []);
 
  return null; // You can return null or any loading indicator if needed
};
 
export default IndexPage;
 