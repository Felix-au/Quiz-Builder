
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, LogIn, UserPlus, KeyRound, Chrome } from 'lucide-react';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">PrashnaSetu</CardTitle>
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
              <Button type="submit" className="w-full" disabled={loading}>
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
                <Button type="submit" className="w-full" disabled={loading}>
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
  );
};

export default LoginScreen;
