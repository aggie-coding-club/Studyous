'use client';

import { useState } from 'react';
import { supabase } from '../supabase-client';
import { useRouter } from 'next/navigation';

export default function CreateAccountForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password || !confirmPassword || !firstName || !lastName || !username) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      );
      setLoading(false);
      return;
    }

    try {
      // Check if username is already taken
      const { data: usernameTaken, error: usernameCheckError } = await supabase.rpc('is_username_taken', { p_username: username });

      if (usernameCheckError) {
        throw usernameCheckError;
      }

      if (usernameTaken) {
        setError('Username is already taken.');
        setLoading(false);
        return;
      }

      // Create User with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || 'Sign up failed.')
        setLoading(false);
        return;
      }

      if (!authData?.user) {
        setError('Sign up failed - no user returned.');
        setLoading(false);
        return;
      }

      // Insert public profile
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        username,
        email,
      });

      if (profileError) {
        if (profileError.code === '23505') {
          setError('Email is already registered. Try signing in.');
        } else {
          setError('Failed to create profile: ' + (profileError.message || 'Unknown error'));
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

    } catch (err: any) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4 bg-[#500000] p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-center">Create Account</h2>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => { setFirstName(e.target.value); setError(''); }}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => { setLastName(e.target.value); setError(''); }}
          className="border p-2 rounded"
          required
        />
      </div>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(''); }}
        className="border p-2 rounded"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setError(''); }}
        className="border p-2 rounded"
        required
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
        className="border p-2 rounded"
        required
      />

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => { setUsername(e.target.value); setError(''); }}
        className="border p-2 rounded"
        required
      />

      {error && <p className="text-red-400 text-sm text-center mt-1">{error}</p>}
      {success && <p className="text-green-400 text-sm text-center mt-1">Account created! Check your email for confirmation.</p>}

      <button
        type="submit"
        className="bg-black text-white py-2 rounded hover:bg-red-900"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <button
        type="button"
        className="bg-black text-white py-2 rounded hover:bg-red-900"
        onClick={() => setTimeout(() => router.push('/login'), 1000)}
      >
        Log In
      </button>
    </form>
  );
}
