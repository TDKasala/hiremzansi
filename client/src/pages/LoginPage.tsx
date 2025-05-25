import React from 'react';
import { SignIn } from '../components/auth/SignIn';

export function LoginPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <h1 className="text-2xl font-bold text-center mb-6">Welcome Back to ATSBoost</h1>
      <SignIn />
    </div>
  );
}