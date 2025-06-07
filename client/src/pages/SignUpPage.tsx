import React from 'react';
import { Helmet } from 'react-helmet';
import { SignUp } from '../components/auth/SignUp';

export function SignUpPage() {
  return (
    <>
      <Helmet>
        <title>Create Account - Hire Mzansi | Free CV Optimization</title>
        <meta name="description" content="Join Hire Mzansi for free and transform your career with AI-powered CV optimization, professional templates, and personalized insights for the South African job market." />
        <meta name="keywords" content="sign up, register, create account, hire mzansi, free cv optimization, south africa, career advancement" />
        <meta property="og:title" content="Join Hire Mzansi - Free CV Optimization" />
        <meta property="og:description" content="Start your career transformation journey with Hire Mzansi's intelligent CV optimization platform." />
        <meta property="og:type" content="website" />
      </Helmet>
      <SignUp />
    </>
  );
}