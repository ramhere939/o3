import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield } from 'lucide-react';
import type { Role } from '@/types/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@o3.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Mock role assignment based on email for testing purposes
    let role: Role = 'Super Admin';
    if (email.includes('kyc')) role = 'KYC Admin';
    else if (email.includes('catalog')) role = 'Catalog Admin';
    else if (email.includes('ops')) role = 'Ops Admin';
    else if (email.includes('finance')) role = 'Finance Admin';
    else if (email.includes('content')) role = 'Content Admin';

    login({
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0].toUpperCase(),
      email,
      role,
    });

    // Default route logic based on role
    if (role === 'KYC Admin') navigate('/admin/kyc');
    else if (role === 'Catalog Admin') navigate('/admin/catalog');
    else if (role === 'Ops Admin') navigate('/admin/disputes');
    else navigate('/admin/dashboard');
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg border-muted">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">O3 Admin Console</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin portal
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="admin@o3.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex flex-col gap-4">
            <Button type="submit" className="w-full">Sign In</Button>
            <div className="text-xs text-left text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-md mt-4">
              <span className="font-semibold block mb-1">Tip: Use these emails to test roles:</span>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>admin@o3.com</strong> ➔ Super Admin (All Access)</li>
                <li><strong>kyc@o3.com</strong> ➔ KYC Admin (KYC Queue)</li>
                <li><strong>catalog@o3.com</strong> ➔ Catalog Admin (Master Data)</li>
                <li><strong>ops@o3.com</strong> ➔ Ops Admin (Disputes)</li>
                <li><strong>finance@o3.com</strong> ➔ Finance Admin</li>
                <li><strong>content@o3.com</strong> ➔ Content Admin</li>
              </ul>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
