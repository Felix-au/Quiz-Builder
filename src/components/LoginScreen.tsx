import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, LogIn, UserPlus, KeyRound, ChevronDown, Home as HomeIcon } from 'lucide-react';

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LoginScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyEmailAddress, setVerifyEmailAddress] = useState<string>('');
  const { toast } = useToast();

  // Navigate only when eligible (avoid while modal is open)
  useEffect(() => {
    const maybeNavigate = async () => {
      if (!user || showVerifyDialog) return;
      // Allow navigation for non-password providers (e.g., Google)
      const providerId = user.providerData[0]?.providerId;
      if (providerId && providerId !== 'password') {
        navigate("/home", { replace: true });
        return;
      }
      // For password provider, only navigate if email is verified
      try {
        await user.reload();
      } catch (_) {
        // ignore reload errors
      }
      if (user.emailVerified) {
        navigate("/home", { replace: true });
      }
    };
    maybeNavigate();
  }, [user, showVerifyDialog, navigate]);

  // Resend verification by signing in with current email/password, sending link, then signing out
  const handleResendVerification = async () => {
    if (!verifyEmailAddress || !password) {
      toast({ title: 'Missing information', description: 'Enter your email and password to resend the verification link.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, verifyEmailAddress, password);
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      }
      toast({ title: 'Verification email sent', description: `A new link was sent to ${verifyEmailAddress}.` });
    } catch (e: any) {
      toast({ title: 'Could not resend', description: e.message, variant: 'destructive' });
    } finally {
      try { await auth.signOut(); } catch {}
      setLoading(false);
    }
  };

  // User claims they verified: sign in, reload, check verified; redirect if verified
  const handleIHaveVerified = async () => {
    if (!verifyEmailAddress || !password) {
      toast({ title: 'Missing information', description: 'Enter your email and password to continue.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    let success = false;
    try {
      await signInWithEmailAndPassword(auth, verifyEmailAddress, password);
      const u = auth.currentUser;
      if (u) {
        try { await u.reload(); } catch {}
        if (u.emailVerified) {
          setShowVerifyDialog(false);
          success = true;
          navigate('/home', { replace: true });
          return;
        }
      }
      toast({ title: 'Still not verified', description: 'We could not confirm verification yet. Please check your inbox and try again.' });
    } catch (e: any) {
      toast({ title: 'Sign-in failed', description: e.message, variant: 'destructive' });
    } finally {
      if (!success) {
        try { await auth.signOut(); } catch {}
      }
      setLoading(false);
    }
  };

  // Handle scroll to show login form on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) { // Mobile only
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        if (scrollY > windowHeight * 0.3) { // Show form after 30% scroll
          setShowLoginForm(true);
        } else {
          setShowLoginForm(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide scrollbar on this page while keeping scroll functionality
  useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    htmlEl.classList.add('no-scrollbar');
    bodyEl.classList.add('no-scrollbar');
    return () => {
      htmlEl.classList.remove('no-scrollbar');
      bodyEl.classList.remove('no-scrollbar');
    };
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        if (auth.currentUser) {
          try {
            await sendEmailVerification(auth.currentUser);
          } catch (_) {
            // ignore send errors here; user will still see the modal
          }
        }
        setVerifyEmailAddress(email);
        setShowVerifyDialog(true);
        // Sign out unverified users to block access until verification
        await auth.signOut();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // After sign-in, check verification status for password users
        if (auth.currentUser && auth.currentUser.providerData[0]?.providerId === 'password' && !auth.currentUser.emailVerified) {
          try { await sendEmailVerification(auth.currentUser); } catch (_) {}
          setVerifyEmailAddress(email);
          setShowVerifyDialog(true);
          await auth.signOut();
          return;
        }
        toast({
          title: "Signed in successfully!",
          description: "Welcome back to PrashnaSetu",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password reset email sent",
        description: "Check your email for reset instructions",
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Failed to send reset email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({
        title: "Signed in with Google",
        description: "Welcome to PrashnaSetu",
      });
    } catch (error: any) {
      toast({
        title: "Google sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Verification Modal */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify your email</DialogTitle>
            <DialogDescription>
              We sent a verification link to <span className="font-medium">{verifyEmailAddress}</span>. Please click the link in your inbox to activate your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Tip: Check your Spam/Junk folder if you don’t see the email within a minute.
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button asChild variant="outline" size="sm">
                <a href="https://mail.google.com" target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
                    <rect x="2" y="5" width="20" height="14" rx="2" ry="2" fill="#ffffff" stroke="#E53935" stroke-width="1.5"/>
                    <path d="M3 7l9 6 9-6" fill="none" stroke="#E53935" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 18V8l8 5 8-5v10" fill="none" stroke="#D32F2F" stroke-width="1.2" stroke-linejoin="round"/>
                  </svg>
                  Gmail
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="https://outlook.live.com/mail/0/" target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4"><path fill="#0364B8" d="M45,12.7v22.6c0,1.3-0.9,2.4-2.2,2.7l-19.9,4c-0.8,0.2-1.6-0.4-1.6-1.3V7.3c0-0.9,0.8-1.5,1.6-1.3l19.9,4 C44.1,10.3,45,11.4,45,12.7z"/><path fill="#28A8EA" d="M23.3 6l10.7 2.2v31.6L23.3 42z"/><path fill="#0078D4" d="M3 14c0-1.1.9-2 2-2h17v24H5c-1.1 0-2-.9-2-2V14z"/><path fill="#50D9FF" d="M12 30c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8z"/></svg>
                  Outlook
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="https://mail.yahoo.com" target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
                    <rect x="2" y="3" width="20" height="18" rx="4" fill="#5F01D1"/>
                    <path d="M7 7l3 5v4h2v-4l3-5h-2.2L12 10.6 9.2 7H7z" fill="#ffffff"/>
                    <rect x="16.5" y="13.7" width="1.8" height="3.8" rx="0.9" fill="#ffffff"/>
                  </svg>
                  Yahoo
                </a>
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" onClick={handleResendVerification} disabled={loading}>Resend verification link</Button>
              <div className="space-x-2">
                <Button variant="secondary" onClick={handleIHaveVerified} disabled={loading}>I've verified</Button>
                <Button onClick={() => setShowVerifyDialog(false)} disabled={loading}>Close</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Darker Background Layers (like Home) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-800 via-indigo-900 to-blue-950" />
      <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(ellipse_at_center,_rgba(79,70,229,0.45),_transparent_60%)]" />
      <div className="absolute inset-0 -z-10 bg-black/20" />
      <div className="absolute -z-10 w-80 h-80 bg-indigo-500/40 rounded-full blur-3xl -top-16 -left-16" />
      <div className="absolute -z-10 w-96 h-96 bg-blue-500/45 rounded-full blur-3xl top-1/4 -right-20" />
      <div className="absolute -z-10 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl bottom-0 left-1/3" />
      {/* Desktop Layout - Original Design */}
      <div className="hidden md:flex flex-col min-h-screen">
        {/* Top-right Home button (desktop) */}
        <div className="hidden md:block absolute top-4 right-4 z-50">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            className="bg-white/70 backdrop-blur hover:bg-white"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <div className="w-full max-w-screen-xl grid grid-cols-2 shadow-xl rounded-lg overflow-hidden bg-white/95 h-[85vh]">
        {/* Left Branding Section */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400 text-gray-900 p-8 h-full w-full">
          <div className="text-center max-w-xs mx-auto cursor-pointer" onClick={() => navigate('/') }>
            <img src="/logo1light.png" alt="PrashnaSetu Logo" className="mx-auto h-62 w-212 object-contain" />
            <p className="text-base opacity-80 -mt-2 leading-tight">PrashnaSetu is a modern, full-screen quiz app that presents randomized questions with images, and provides real-time monitoring to ensure academic integrity.</p>
          </div>
        </div>
            
            {/* Right Form Section */}
            <div className="flex items-center justify-center bg-background p-8">
              <Card className="w-full max-w-md shadow-none border-0">
                <CardHeader className="text-center pb-2">
                  <CardDescription>
                    {showForgotPassword 
                      ? 'Reset your password' 
                      : isSignUp 
                        ? 'Create your account' 
                        : 'Sign in to your account'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showForgotPassword ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" disabled={loading}>
                        <KeyRound className="w-4 h-4 mr-2" />
                        {loading ? 'Sending...' : 'Send Reset Email'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full"
                        onClick={() => setShowForgotPassword(false)}
                      >
                        Back to Sign In
                      </Button>
                    </form>
                  ) : (
                    <>
                      <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" disabled={loading}>
                          {isSignUp ? <UserPlus className="w-4 h-4 mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                          {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                        </Button>
                      </form>

                      <Separator />

                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full h-10 rounded-lg bg-white text-gray-800 font-semibold border border-gray-300 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 31.7 29.5 35 24 35 16.8 35 11 29.2 11 22s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.3l5.7-5.7C34.9 3.3 29.7 1 24 1 11.8 1 2 10.8 2 23s9.8 22 22 22c12.1 0 21-8.6 21-21 0-1.3-.1-2.7-.4-3.5z"/>
                          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.3 18.9 13 24 13c3.3 0 6.3 1.2 8.6 3.3l5.7-5.7C34.9 3.3 29.7 1 24 1 16 1 8.8 5.9 6.3 14.7z"/>
                          <path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.7 36.3 27 37 24 37c-5.5 0-10.2-3.6-12.1-8.6l-6.6 5.1C8.8 41.6 15.9 45 24 45z"/>
                          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.7 3.2-6.1 6.5-11.3 6.5-7.2 0-13-5.8-13-13 0-2 .5-3.9 1.3-5.6l-6.7-5.1C3.7 13.3 2 17.5 2 22c0 12.2 9.8 22 22 22 12.1 0 21-8.6 21-21 0-1.3-.1-2.7-.4-3.5z"/>
                        </svg>
                        Continue with Google
                      </button>

                      

                      <div className="text-center space-y-2">
                        {!isSignUp && (
                          <Button 
                            type="button" 
                            variant="link" 
                            className="text-sm"
                            onClick={() => setShowForgotPassword(true)}
                          >
                            Forgot your password?
                          </Button>
                        )}
                        <div>
                          <Button 
                            type="button" 
                            variant="link" 
                            className="text-sm"
                            onClick={() => setIsSignUp(!isSignUp)}
                          >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Copyright Footer Full-width - Desktop */}
        <div className="hidden md:block fixed bottom-0 left-0 w-full bg-white/60 backdrop-blur-xl border-t border-indigo-200/60 py-3 text-center text-xs text-gray-700 z-50">
          <p>  Copyrighted by CAD-CS, BML Munjal University</p>
          <p><Mail className="inline-block w-4 h-4 mr-1 -mt-1 align-middle text-gray-500" /><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-indigo-700">cadcs@bmu.edu.in</a></p>
        </div>
      </div>

      {/* Mobile Layout - Two Screen Design */}
      <div className="md:hidden">
        {/* Screen 1: Logo Screen */}
        <div className="h-screen flex flex-col items-center justify-center text-gray-900 p-8 relative">
          <div className="text-center max-w-xs mx-auto animate-bounce-slow cursor-pointer" onClick={() => navigate('/') }>
            <img src="/logo1light.png" alt="PrashnaSetu Logo" className="mx-auto h-96 w-96 object-contain" />
            <p className="text-sm opacity-80 -mt-4 leading-tight">PrashnaSetu is a modern, full-screen quiz app that presents randomized questions with images, and provides real-time monitoring to ensure academic integrity.</p>
            
            {/* Copyright Footer - Mobile Screen 1 */}
            <div className="text-center text-xs text-gray-600 mt-6">
              <p>  Copyrighted by CAD-CS, BML Munjal University</p>
              <p><Mail className="inline-block w-4 h-4 mr-1 -mt-1 align-middle text-gray-500" /> : <a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center animate-pulse">
            <p className="text-sm text-gray-700 mb-2">Scroll down to login</p>
            <ChevronDown className="h-6 w-6 mx-auto text-gray-600 animate-bounce" />
          </div>
        </div>

        {/* Screen 2: Login Form Screen */}
        <div className={`min-h-screen flex flex-col justify-center p-4 transition-opacity duration-500 ${showLoginForm ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md shadow-none border-0">
            <CardHeader className="text-center pb-2">
              <CardDescription>
                {showForgotPassword 
                  ? 'Reset your password' 
                  : isSignUp 
                    ? 'Create your account' 
                    : 'Sign in to your account'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" disabled={loading}>
                    <KeyRound className="w-4 h-4 mr-2" />
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Back to Sign In
                  </Button>
                </form>
              ) : (
                <>
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" disabled={loading}>
                      {isSignUp ? <UserPlus className="w-4 h-4 mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                      {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                    </Button>
                  </form>

                  <Separator />

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full h-10 rounded-lg bg-white text-gray-800 font-semibold border border-gray-300 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 31.7 29.5 35 24 35 16.8 35 11 29.2 11 22s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.3l5.7-5.7C34.9 3.3 29.7 1 24 1 11.8 1 2 10.8 2 23s9.8 22 22 22c12.1 0 21-8.6 21-21 0-1.3-.1-2.7-.4-3.5z"/>
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.3 18.9 13 24 13c3.3 0 6.3 1.2 8.6 3.3l5.7-5.7C34.9 3.3 29.7 1 24 1 16 1 8.8 5.9 6.3 14.7z"/>
                      <path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.7 36.3 27 37 24 37c-5.5 0-10.2-3.6-12.1-8.6l-6.6 5.1C8.8 41.6 15.9 45 24 45z"/>
                      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.7 3.2-6.1 6.5-11.3 6.5-7.2 0-13-5.8-13-13 0-2 .5-3.9 1.3-5.6l-6.7-5.1C3.7 13.3 2 17.5 2 22c0 12.2 9.8 22 22 22 12.1 0 21-8.6 21-21 0-1.3-.1-2.7-.4-3.5z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/')}
                  >
                    <HomeIcon className="w-4 h-4 mr-2" />
                    Home
                  </Button>

                  <div className="text-center space-y-2">
                    {!isSignUp && (
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-sm"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot your password?
                      </Button>
                    )}
                    <div>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="text-sm"
                        onClick={() => setIsSignUp(!isSignUp)}
                      >
                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          </div>
          
          {/* Copyright Footer - Mobile Screen 2 */}
          <div className="text-center text-xs text-gray-600 py-4">
            <p>  Copyrighted by CAD-CS, BML Munjal University</p>
            <p><Mail className="inline-block w-4 h-4 mr-1 -mt-1 align-middle text-gray-500" /><a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
