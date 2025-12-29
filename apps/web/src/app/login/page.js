

import React, { Suspense } from 'react';
import LoginForm from "@/src/components/LoginForm.js";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
