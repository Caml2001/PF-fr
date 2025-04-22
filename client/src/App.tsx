import React from 'react';

function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Microcréditos App</h1>
      <p className="text-gray-600">Aplicación simplificada para pruebas</p>
      
      <div className="mt-6 p-4 bg-blue-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Préstamo pre-aprobado</h2>
        <div className="text-3xl font-bold mb-3">$5,000</div>
        <button className="bg-blue-500 text-white py-2 px-4 rounded w-full">
          Solicitar crédito
        </button>
      </div>
    </div>
  );
}

export default App;
