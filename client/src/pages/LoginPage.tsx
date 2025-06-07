import React from 'react';
import { Helmet } from 'react-helmet';
import { SignIn } from '../components/auth/SignIn';

export function LoginPage() {
  return (
    <>
      <Helmet>
        <title>Sign In - Hire Mzansi | CV Optimization Platform</title>
        <meta name="description" content="Sign in to your Hire Mzansi account to access AI-powered CV optimization, ATS-friendly templates, and career enhancement tools designed for South African professionals." />
        <meta name="keywords" content="sign in, login, hire mzansi, cv optimization, south africa, career, jobs" />
        <meta property="og:title" content="Sign In - Hire Mzansi" />
        <meta property="og:description" content="Access your Hire Mzansi account to continue optimizing your career prospects." />
        <meta property="og:type" content="website" />
      </Helmet>
      <SignIn />
    </>
  );
}