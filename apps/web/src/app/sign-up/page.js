
import React, { Suspense } from 'react';
import SignUpForm from "@/src/components/SignUpForm.js";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
