
import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthCard: React.FC = () => {
  return (
    <Card className="w-full max-w-md">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <CardHeader>
            <CardTitle>Log In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <LoginForm />
        </TabsContent>
        
        <TabsContent value="signup">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Enter your details to create a new account
            </CardDescription>
          </CardHeader>
          <SignupForm />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AuthCard;
