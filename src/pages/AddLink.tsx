import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Platform {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

const AddLink = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    platform_id: '',
    category_id: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const [platformsData, categoriesData] = await Promise.all([
        supabase.from('platforms').select('*'),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (platformsData.data) setPlatforms(platformsData.data);
      if (categoriesData.data) setCategories(categoriesData.data);
    };

    fetchData();
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!/[A-Z]/.test(password)) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (!/[0-9]/.test(password)) {
      return 'La contraseña debe contener al menos un número';
    }
    return null;
  };

  const validateUrl = (url: string, platformId: string): string | null => {
    // Si no hay URL o plataforma, no validamos aún
    if (!url || !platformId) return null;

    // Buscar la plataforma seleccionada
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return null;

    // Validaciones específicas por plataforma
    switch (platform.name) {
      case 'whatsapp':
        if (!url.includes('chat.whatsapp.com/') && !url.includes('wa.me/')) {
          return 'La URL debe ser un enlace válido de WhatsApp (chat.whatsapp.com o wa.me)';
        }
        break;
      case 'telegram':
        if (!url.includes('t.me/')) {
          return 'La URL debe ser un enlace válido de Telegram (t.me)';
        }
        break;
      case 'facebook':
        if (!url.includes('facebook.com') && !url.includes('fb.com')) {
          return 'La URL debe ser un enlace válido de Facebook (facebook.com o fb.com)';
        }
        break;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar URL según la plataforma seleccionada
    const urlError = validateUrl(formData.url, formData.platform_id);
    if (urlError) {
      toast.error(urlError);
      return;
    }

    try {
      const { error } = await supabase.from('links').insert([formData]);

      if (error) {
        toast.error('Error al guardar el enlace');
      } else {
        toast.success('Enlace guardado exitosamente');
        navigate(`/category/${formData.category_id}`);
      }
    } catch (error) {
      toast.error('Error al guardar el enlace');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(authForm.password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    try {
      if (isSignUp) {
        await signUp(authForm.email, authForm.password);
        toast.success('Cuenta creada exitosamente. Por favor, inicia sesión.');
        setIsSignUp(false);
      } else {
        await signIn(authForm.email, authForm.password);
        toast.success('Sesión iniciada exitosamente');
      }
    } catch (error: any) {
      const errorMessage = error.message || (isSignUp ? 'Error al crear la cuenta' : 'Error al iniciar sesión');

      if (errorMessage.includes('Invalid login credentials')) {
        toast.error('Correo electrónico o contraseña incorrectos');
      } else if (errorMessage.includes('User already registered')) {
        toast.error('Este correo electrónico ya está registrado');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h1>
        <form onSubmit={handleAuthSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={authForm.email}
              onChange={handleAuthChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={authForm.password}
              onChange={handleAuthChange}
            />
            {isSignUp && (
              <p className="mt-2 text-sm text-gray-500">
                La contraseña debe tener al menos 6 caracteres, una letra mayúscula y un número.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-indigo-600 text-sm hover:text-indigo-700"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Compartir Nuevo Enlace</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            URL del Enlace
          </label>
          <input
            type="url"
            id="url"
            name="url"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.url}
            onChange={handleChange}
            onBlur={() => {
              const error = validateUrl(formData.url, formData.platform_id);
              if (error) toast.error(error);
            }}
          />
        </div>

        <div>
          <label htmlFor="platform_id" className="block text-sm font-medium text-gray-700">
            Plataforma
          </label>
          <select
            id="platform_id"
            name="platform_id"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.platform_id}
            onChange={handleChange}
          >
            <option value="">Selecciona una plataforma</option>
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
            Categoría
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.category_id}
            onChange={handleChange}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Guardar Enlace
        </button>
      </form>
    </div>
  );
}

export default AddLink;