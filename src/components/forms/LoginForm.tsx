'use client';

import { useState } from "react";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import api from "@/app/services/api";

type FormValues = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const router = useRouter();
  const [error, setError] = useState("");

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await api.post('/login', data);

      const token = res.data.token;
      localStorage.setItem("token", token);

      router.push("/dashboard");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Credenciales inválidas");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm w-full space-y-4 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold text-center">Iniciar sesión</h2>

      <div>
        <label className="block mb-1 text-sm">Correo</label>
        <input
          {...register("email", { required: true })}
          type="email"
          autoComplete="email"
          value="maycon.guzman@sura.pe"
          className="w-full border rounded px-3 py-2"
        />
        {errors.email && <span className="text-red-500 text-xs">Este campo es obligatorio</span>}
      </div>

      <div>
        <label className="block mb-1 text-sm">Contraseña</label>
        <input
          {...register("password", { required: true })}
          type="password"
          autoComplete="current-password"
          value="********"
          className="w-full border rounded px-3 py-2"
        />
        {errors.password && <span className="text-red-500 text-xs">Este campo es obligatorio</span>}
      </div>

      {error && <div className="text-red-600 text-sm text-center">{error}</div>}

      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
        Ingresar
      </button>
    </form>
  );
}
