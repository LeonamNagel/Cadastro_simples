import React, { useState, FormEvent } from 'react';
import { Customer } from './types';

const Header: React.FC = () => (
  <header className="text-center mb-10">
    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
      Cadastro de Clientes
    </h1>
    <p className="text-slate-400 mt-2">Adicione, visualize e gerencie seus clientes com facilidade.</p>
  </header>
);

const CustomerForm: React.FC<{ onAddCustomer: (name: string, phone: string) => void }> = ({ onAddCustomer }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Nome e telefone são obrigatórios.');
      return;
    }
    onAddCustomer(name, phone);
    setName('');
    setPhone('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg shadow-lg mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Nome do Cliente</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João da Silva"
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">Telefone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex: (11) 99999-8888"
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
          />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      <button
        type="submit"
        className="w-full mt-6 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
      >
        Adicionar Cliente
      </button>
    </form>
  );
};

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const CustomerItem: React.FC<{ customer: Customer; onDelete: (id: number) => void }> = ({ customer, onDelete }) => (
  <li className="bg-slate-800 p-5 rounded-lg shadow-md flex justify-between items-center transition-all duration-300 hover:bg-slate-700/50 hover:shadow-sky-500/10">
    <div>
      <p className="text-lg font-semibold text-sky-400">{customer.name}</p>
      <p className="text-slate-400">{customer.phone}</p>
    </div>
    <button
      onClick={() => onDelete(customer.id)}
      className="text-slate-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10"
      aria-label={`Remover ${customer.name}`}
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  </li>
);

const CustomerList: React.FC<{ customers: Customer[]; onDeleteCustomer: (id: number) => void }> = ({ customers, onDeleteCustomer }) => (
  <div>
    <h2 className="text-2xl font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2">Clientes Cadastrados</h2>
    {customers.length === 0 ? (
      <div className="text-center py-10 px-6 bg-slate-800 rounded-lg">
        <p className="text-slate-400">Nenhum cliente cadastrado ainda.</p>
        <p className="text-slate-500 text-sm mt-1">Use o formulário acima para começar.</p>
      </div>
    ) : (
      <ul className="space-y-4">
        {customers.map((customer) => (
          <CustomerItem key={customer.id} customer={customer} onDelete={onDeleteCustomer} />
        ))}
      </ul>
    )}
  </div>
);

const App: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const addCustomer = (name: string, phone: string) => {
    const newCustomer: Customer = {
      id: Date.now(),
      name,
      phone,
    };
    setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
  };

  const deleteCustomer = (id: number) => {
    setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 md:p-8">
      <main className="max-w-3xl mx-auto">
        <Header />
        <CustomerForm onAddCustomer={addCustomer} />
        <CustomerList customers={customers} onDeleteCustomer={deleteCustomer} />
      </main>
    </div>
  );
};

export default App;
