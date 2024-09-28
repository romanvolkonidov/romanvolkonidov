// src/components/LoginPage.js
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"; // Adjust import as needed
import { Input } from "@/components/ui/Input"; // Adjust import as needed
import { Button } from "@/components/ui/Button"; // Adjust import as needed
import  Label  from "@/components/ui/Label"; // Adjust import as needed
import { User, Lock } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Mock API call
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        // Handle successful login (e.g., save token, redirect)
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Card className="w-full max-w-md bg-black bg-opacity-50 backdrop-blur-md border border-gray-600">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-white">Student Login</CardTitle>
          <p className="text-sm text-center text-gray-400">Enter your credentials to access your account</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-200">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full text-white bg-gray-800 border-gray-600 focus:border-white focus:ring-white"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-200">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full text-white bg-gray-800 border-gray-600 focus:border-white focus:ring-white"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-white hover:bg-gray-200 text-black font-semibold transition-colors duration-300"
            >
              Log In
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-center pb-4">
            <a href="#" className="text-sm text-gray-400 hover:text-white">Forgot password?</a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
