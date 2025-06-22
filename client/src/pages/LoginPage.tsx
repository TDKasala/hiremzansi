import React from 'react';
import { Helmet } from 'react-helmet';
import { SignIn } from '../components/auth/SignIn';

export function LoginPage() {
  return (
    <>
      <Helmet>
        <title>Sign In to Hire Mzansi - Access Your AI CV Optimization Dashboard | South African Job Platform</title>
        <meta name="description" content="Sign in to your Hire Mzansi account to access AI-powered CV optimization, B-BBEE compliance analysis, job matching, and premium career tools for South African professionals. Secure login portal." />
        <meta name="keywords" content="hire mzansi login, cv optimization account, south african job platform sign in, ats analysis login, b-bbee cv account, professional dashboard, career tools access" />
        <meta property="og:title" content="Sign In to Hire Mzansi - AI CV Optimization Platform" />
        <meta property="og:description" content="Access your personalized CV optimization dashboard with AI-powered tools, job matching, and career insights for South African professionals." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hiremzansi.co.za/login" />
        <meta property="og:locale" content="en_ZA" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://hiremzansi.co.za/login" />
      </Helmet>
      <SignIn />
    </>
  );
}