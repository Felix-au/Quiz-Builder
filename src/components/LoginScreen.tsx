import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, LogIn, UserPlus, KeyRound, Chrome, ChevronDown } from 'lucide-react';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { toast } = useToast();

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Account created successfully!",
          description: "Welcome to PrashnaSetu",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
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
    <div className="min-h-screen bg-background">
      {/* Desktop Layout - Original Design */}
      <div className="hidden md:flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-screen-xl grid grid-cols-2 shadow-xl rounded-lg overflow-hidden bg-white">
            {/* Left Branding Section */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400 text-gray-900 p-8 h-full min-h-screen w-full">
              <div className="text-center max-w-xs mx-auto">
                <img src="/logo23.png" alt="PrashnaSetu Logo" className="mx-auto h-56 w-56 object-contain" />
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

                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                      >
                        <Chrome className="w-4 h-4 mr-2" />
                        Continue with Google
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
          </div>
        </div>
        
        {/* Copyright Footer Full-width - Desktop */}
        <div className="hidden md:block fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-600 z-50">
          <p>© Copyrighted by CAD-CS, BML Munjal University</p>
          <p><Mail className="inline-block w-4 h-4 mr-1 -mt-1 align-middle text-gray-500" /> : <a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
        </div>
      </div>

      {/* Mobile Layout - Two Screen Design */}
      <div className="md:hidden">
        {/* Screen 1: Logo Screen */}
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400 text-gray-900 p-8 relative">
          <div className="text-center max-w-xs mx-auto animate-bounce-slow">
            <img src="/logo23.png" alt="PrashnaSetu Logo" className="mx-auto h-48 w-48 object-contain" />
            <p className="text-sm opacity-80 -mt-2 leading-tight">PrashnaSetu is a modern, full-screen quiz app that presents randomized questions with images, and provides real-time monitoring to ensure academic integrity.</p>
            
            {/* Copyright Footer - Mobile Screen 1 */}
            <div className="text-center text-xs text-gray-600 mt-6">
              <p>© Copyrighted by CAD-CS, BML Munjal University</p>
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
        <div className={`min-h-screen bg-background flex flex-col justify-center p-4 transition-opacity duration-500 ${showLoginForm ? 'opacity-100' : 'opacity-0'}`}>
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

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    Continue with Google
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
            <p>© Copyrighted by CAD-CS, BML Munjal University</p>
            <p><Mail className="inline-block w-4 h-4 mr-1 -mt-1 align-middle text-gray-500" /> : <a href="mailto:cadcs@bmu.edu.in" className="underline hover:text-blue-700">cadcs@bmu.edu.in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
