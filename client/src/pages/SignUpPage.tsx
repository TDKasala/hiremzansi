import React from 'react';
import { SignUp } from '../components/auth/SignUp';

export function SignUpPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <h1 className="text-2xl font-bold text-center mb-6">Join ATSBoost</h1>
      <SignUp />
    </div>
  );
}