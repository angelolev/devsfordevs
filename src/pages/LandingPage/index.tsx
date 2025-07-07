import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col justify-center items-center font-mono px-4">
      <div className="w-full max-w-5xl bg-black rounded-lg shadow-lg p-8 m-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="h-4 w-4 bg-red-500 rounded-full"></span>
            <span className="h-4 w-4 bg-yellow-500 rounded-full"></span>
            <span className="h-4 w-4 bg-green-500 rounded-full"></span>
          </div>
          <span className="text-sm">bash - Dev4Devs</span>
        </div>
        <div className="text-lg">
          <p className="text-green-400">$ npm start</p>
          <p>Iniciando Dev4Devs...</p>
          <br />
          <p className="text-green-400">$ echo "Bienvenido a Dev4Devs"</p>
          <p>Bienvenido a Dev4Devs</p>
          <br />
          <p className="text-green-400">$ cat about.txt</p>
          <p>
            Una red social minimalista creada específicamente para que los
            desarrolladores compartan ideas, hablen de programación y se conecten
            con la comunidad.
          </p>
          <br />
          <p className="text-green-400">$ ls /caracteristicas</p>
          <ul className="list-disc list-inside">
            <li>Autenticación OAuth</li>
            <li>Selección de nombre de usuario</li>
            <li>Sistema de notificaciones</li>
            <li>Sistema de seguimiento</li>
            <li>Subida de imágenes</li>
            <li>Tema oscuro/claro</li>
            <li>Comentarios anidados</li>
            <li>Reacciones</li>
            <li>Filtrado por temas</li>
            <li>Diseño adaptable</li>
          </ul>
          <br />
          <p className="text-green-400">$</p>
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/feed"
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Entrar a Dev4Devs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
