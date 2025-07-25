import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Shield, CheckCircle, AlertTriangle } from "lucide-react";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordResetModal({ isOpen, onClose }: PasswordResetModalProps) {
  const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'patient' | 'provider'>('patient');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !userType) {
      toast({
        title: "Missing Information",
        description: "Please enter your email and select account type.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/password-reset/request', {
        email,
        userType,
      });

      // For demo purposes, the API returns the token
      // In production, this would be sent via email
      const data = await response.json();
      if (data.resetToken) {
        setToken(data.resetToken);
      }
      
      setStep('verify');
      toast({
        title: "Reset Link Sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({
        title: "Missing Token",
        description: "Please enter the reset token from your email.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiRequest('POST', '/api/password-reset/verify', { token });
      setStep('reset');
      toast({
        title: "Token Verified",
        description: "You can now set your new password.",
      });
    } catch (error: any) {
      toast({
        title: "Invalid Token",
        description: error.message || "The reset token is invalid or expired.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in both password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiRequest('POST', '/api/password-reset/reset', {
        token,
        newPassword,
      });
      
      setStep('success');
      toast({
        title: "Password Reset",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('request');
    setEmail('');
    setUserType('patient');
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 'request':
        return (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userType">Account Type</Label>
              <Select value={userType} onValueChange={(value: 'patient' | 'provider') => setUserType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="provider">Healthcare Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Mail className="w-4 h-4 mr-2" />
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        );

      case 'verify':
        return (
          <form onSubmit={handleVerifyToken} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Reset Token</Label>
              <Input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter the token from your email"
                required
              />
              <p className="text-sm text-muted-foreground">
                For demo: The token has been auto-filled. In production, check your email.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Shield className="w-4 h-4 mr-2" />
              {loading ? 'Verifying...' : 'Verify Token'}
            </Button>
          </form>
        );

      case 'reset':
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Shield className="w-4 h-4 mr-2" />
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-700">Password Reset Successful!</h3>
              <p className="text-muted-foreground mt-2">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
            </div>
            <Button onClick={resetModal} className="w-full">
              Close
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'request':
        return 'Reset Password';
      case 'verify':
        return 'Verify Reset Token';
      case 'reset':
        return 'Set New Password';
      case 'success':
        return 'Password Reset Complete';
      default:
        return 'Reset Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'request':
        return 'Enter your email address and account type to receive a password reset link.';
      case 'verify':
        return 'Enter the reset token sent to your email address.';
      case 'reset':
        return 'Create a new secure password for your account.';
      case 'success':
        return 'Your password has been successfully reset.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription>
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}