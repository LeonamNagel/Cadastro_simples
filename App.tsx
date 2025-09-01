import React, { useState, useEffect, FormEvent } from 'react';
import { Customer } from './types';

const Header: React.FC = () => (
  <header className="text-center mb-10">
    <h1 className="text-4xl md:text-5xl font-bold text-white">
      Cadastro de Clientes
    </h1>
    <p className="text-gray-300 mt-2">Adicione, visualize e gerencie seus clientes com facilidade.</p>
  </header>
);

const CustomerForm: React.FC<{ 
  onAddCustomer: (name: string, phone: string) => Promise<void>;
  isAdding: boolean;
}> = ({ onAddCustomer, isAdding }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Nome e telefone são obrigatórios.');
      return;
    }
    try {
      await onAddCustomer(name, phone);
      setName('');
      setPhone('');
      setError('');
    } catch (e) {
      console.error(e);
      // O componente pai irá alertar o usuário sobre o erro.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-lg mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-2">Nome do Cliente</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João da Silva"
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:border-white transition"
            disabled={isAdding}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">Telefone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex: (11) 99999-8888"
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:border-white transition"
            disabled={isAdding}
          />
        </div>
      </div>
      {error && <p className="text-red-300 text-sm mt-4">{error}</p>}
      <button
        type="submit"
        disabled={isAdding}
        className="w-full mt-6 bg-white hover:bg-gray-200 text-black font-bold py-3 px-4 rounded-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isAdding ? 'Adicionando...' : 'Adicionar Cliente'}
      </button>
    </form>
  );
};

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const CustomerItem: React.FC<{
  customer: Customer;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}> = ({ customer, onDelete, isDeleting }) => (
  <li className="bg-gray-900 p-5 rounded-lg shadow-md flex justify-between items-center transition-all duration-300 hover:bg-gray-800 hover:shadow-white/10">
    <div>
      <p className="text-lg font-semibold text-white">{customer.name}</p>
      <p className="text-gray-300">{customer.phone}</p>
    </div>
    <button
      onClick={() => onDelete(customer.id)}
      disabled={isDeleting}
      className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-900/20 disabled:text-gray-600 disabled:cursor-not-allowed"
      aria-label={`Remover ${customer.name}`}
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  </li>
);

const CustomerList: React.FC<{
  customers: Customer[];
  onDeleteCustomer: (id: number) => void;
  deletingId: number | null;
}> = ({ customers, onDeleteCustomer, deletingId }) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-600 pb-2">Clientes Cadastrados</h2>
    {customers.length === 0 ? (
      <div className="text-center py-10 px-6 bg-gray-900 rounded-lg">
        <p className="text-gray-300">Nenhum cliente cadastrado ainda.</p>
        <p className="text-gray-400 text-sm mt-1">Use o formulário acima para começar.</p>
      </div>
    ) : (
      <ul className="space-y-4">
        {customers.map((customer) => (
          <CustomerItem
            key={customer.id}
            customer={customer}
            onDelete={onDeleteCustomer}
            isDeleting={deletingId === customer.id}
          />
        ))}
      </ul>
    )}
  </div>
);

const App: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        if (!response.ok) {
          let errorMessage = 'Falha ao buscar clientes do banco de dados.';
          // Tenta extrair uma mensagem de erro mais específica do backend
          try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            // O corpo do erro não era JSON, mantém a mensagem genérica.
          }
          throw new Error(errorMessage);
        }
        const data: Customer[] = await response.json();
        setCustomers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const addCustomer = async (name: string, phone: string) => {
    setIsAdding(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      if (!response.ok) {
        throw new Error('Falha ao adicionar cliente.');
      }
      const newCustomer: Customer = await response.json();
      setCustomers(prevCustomers => [newCustomer, ...prevCustomers]);
    } catch (err: any) {
       console.error("Failed to add customer:", err);
       alert("Erro ao adicionar cliente. Tente novamente.");
       throw err; 
    } finally {
      setIsAdding(false);
    }
  };

  const deleteCustomer = async (id: number) => {
    if (deletingId) return; // Impede múltiplas deleções simultâneas
    setDeletingId(id);
    try {
      const response = await fetch('/api/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
       if (!response.ok) {
        throw new Error('Falha ao remover cliente.');
      }
      setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== id));
    } catch (err: any) {
      console.error("Failed to delete customer:", err);
      alert("Erro ao remover cliente. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-gray-300 mt-10">Carregando clientes...</p>;
    }
    if (error) {
       const isDbUrlError = error.includes("DATABASE_URL");

      if (isDbUrlError) {
        return (
          <div className="text-center py-10 px-6 bg-gray-900 rounded-lg border border-white/30 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-white">Conexão com Banco de Dados</h2>
            <p className="mt-2 text-gray-300">A sua URL de conexão com o banco de dados Neon não foi configurada.</p>
            <div className="mt-6 text-left bg-black/50 p-6 rounded-md">
              <p className="font-semibold text-white mb-3">Siga estes passos para configurar:</p>
              <ol className="text-gray-300 list-decimal list-inside space-y-2">
                <li>
                  Acesse seu painel na <a href="https://console.neon.tech" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-medium">Neon</a> e copie a URL de conexão do banco de dados (formato connection string).
                </li>
                <li>
                  No painel do seu site na <a href="https://app.netlify.com/" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-medium">Netlify</a>, vá para:
                  <br />
                  <code className="bg-gray-800 text-white px-2 py-1 rounded text-sm mt-1 inline-block">Site configuration &rarr; Environment variables</code>
                </li>
                <li>
                  Crie uma nova variável de ambiente com o nome <code className="bg-gray-800 text-white px-2 py-1 rounded text-sm">DATABASE_URL</code> e cole a URL que você copiou.
                </li>
                <li>
                  Faça um novo deploy do seu site para que a alteração tenha efeito.
                </li>
              </ol>
            </div>
          </div>
        )
      }
      return <div className="text-center py-10 px-6 bg-gray-900 rounded-lg">
        <p className="text-red-300">Erro: {error}</p>
        <p className="text-gray-400 text-sm mt-1">Por favor, recarregue a página e tente novamente.</p>
      </div>;
    }
    return <CustomerList customers={customers} onDeleteCustomer={deleteCustomer} deletingId={deletingId} />;
  };

  return (
    <div className="min-h-screen bg-black font-sans p-4 sm:p-6 md:p-8">
      <main className="max-w-3xl mx-auto">
        <Header />
        <CustomerForm onAddCustomer={addCustomer} isAdding={isAdding}/>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
