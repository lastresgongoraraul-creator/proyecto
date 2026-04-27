import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: RegisterForm) => api.post('/auth/register', {
      username: data.username,
      email: data.email,
      password: data.password
    }),
    onSuccess: (response) => {
      login(response.data.accessToken, response.data.user);
      navigate('/');
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error en el registro. Por favor, inténtalo de nuevo.');
      } else {
        setError('Ocurrió un error inesperado.');
      }
    }
  });

  const onSubmit = (data: RegisterForm) => {
    setError(null);
    mutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto mt-8 mb-12">
      <div className="bg-slate-900/50 p-8 rounded-2xl border border-white/10 backdrop-blur-sm shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <UserPlus className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-center">Crear Cuenta</h1>
        <p className="text-slate-400 text-center mb-8">Únete a la comunidad definitiva de gaming</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre de Usuario</label>
            <input
              {...register('username')}
              className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="jugador123"
            />
            {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Correo Electrónico</label>
            <input
              {...register('email')}
              className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="nombre@ejemplo.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar Contraseña</label>
            <input
              {...register('confirmPassword')}
              type="password"
              className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Cuenta'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
