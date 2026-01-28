'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '../supabase-client';

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Will Change this in the Future
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const {data, error: loginError } = await supabase.auth.signInWithPassword({
        email, password,
      });

      if (loginError || !data.user) {
        setError(loginError?.message || "Login failed.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setTimeout(() => router.push('/'), 1000);
    }
    catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4 bg-[#500000] p-6 rounded-lg shadow -mt-10">
        <h2 className = "text-xl font-bold text-center">Log in</h2>

        <input type = "email" placeholder = "Email" value = {email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded" required />

        <input type = "password" placeholder = "Password" value = {password} onChange = {(e) => setPassword(e.target.value)} className = "border p-2 rounded" required />

        {error && (<p className = "text-red-500 text-sm">{error}</p>)}

        <button type = "submit" className = "bg-black text-white py-2 rounded hover:bg-red-900" disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>

        <button type = "button" onClick={() => setTimeout(() => router.push('/create_account'), 1000)} className = "bg-black text-white py-2 rounded hover:bg-red-900">Create Account</button>
    </form>      
  );
}