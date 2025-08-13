'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirm) {
      return setError('Passwords do not match');
    }
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">


          {/* Username input */}
         <Input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              disabled={loading}
            />

          <Input
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
          <Input
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password_confirm"
            placeholder="Confirm Password"
            value={form.password_confirm}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>

         <p className="mt-4 text-sm text-center">
          <i>( Check your email for verification after registering ! )</i>
         
        </p>
      </div>
    </div>
  );
}



// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAuth } from '@/src/hooks/useAuth';
// import { Button } from '@/src/components/ui/button';
// import { Input } from '@/src/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
// import { toast } from 'sonner';

// export default function RegisterPage() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     first_name: '',
//     last_name: '',
//   });
//   const [loading, setLoading] = useState(false);

//   const { register } = useAuth();
//   const router = useRouter();

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await register(formData);
//       toast.success('Registration successful! Please sign in.');
//       router.push('/login');
//     } catch (error) {
//       console.error('Registration error:', error);
//       toast.error('Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-center text-2xl font-bold">Sign Up</CardTitle>
//           <CardDescription className="text-center">
//             Create your account to start splitting bills
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Input
//                   type="text"
//                   name="first_name"
//                   placeholder="First Name"
//                   value={formData.first_name}
//                   onChange={handleInputChange}
//                   required
//                   disabled={loading}
//                 />
//               </div>
//               <div>
//                 <Input
//                   type="text"
//                   name="last_name"
//                   placeholder="Last Name"
//                   value={formData.last_name}
//                   onChange={handleInputChange}
//                   required
//                   disabled={loading}
//                 />
//               </div>
//             </div>
//             <div>
//               <Input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 required
//                 disabled={loading}
//               />
//             </div>
//             <div>
//               <Input
//                 type="password"
//                 name="password"
//                 placeholder="Password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 required
//                 disabled={loading}
//                 minLength={8}
//               />
//             </div>
//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? 'Creating Account...' : 'Sign Up'}
//             </Button>
//             <div className="text-center text-sm">
//               Already have an account?{' '}
//               <Link href="/login" className="text-blue-600 hover:underline">
//                 Sign in
//               </Link>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }