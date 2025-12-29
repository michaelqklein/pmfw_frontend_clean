'use client';
import { useRouter } from 'next/navigation';

export default function NotLoggedInPage() {

      const router = useRouter();
    
      const handleLogin = () => {
        router.push('/login');
      };

    return (
      <div className="reactive-container">
       <h1>You are not logged in</h1>
        <p> Please login or sign up to access free tiers and demos of training apps. 
          (Signing up is free. You don't need to enter paymment information to sign up.)     </p>
        <button className="general-button" onClick={handleLogin}>
        login or sign up
      </button>
      </div>
    );
  }
  