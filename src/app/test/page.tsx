import Link from 'next/link';
import LoaderExamples from '@/components/ui/loader-examples';

export default function TestPage() {
  return (
    <div className="p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Página de Pruebas - Jappi Express</h1>
        <div className="space-x-4">
          <Link 
            href="/login" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ir al Login
          </Link>
          <Link 
            href="/registro" 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Ir al Registro
          </Link>
        </div>
      </div>
      
      <hr className="my-8" />
      
      <LoaderExamples />
    </div>
  );
}
