import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ClientsApi, ProjectsApi, QuotationsApi } from '@/lib/api';

export default function NewQuotationModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [taxRate, setTaxRate] = useState(0);
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]);

  useEffect(() => {
    if (isOpen) {
      ClientsApi.getAll().then(setClients).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (clientId) {
      ProjectsApi.getAll(clientId).then(setProjects).catch(console.error);
    } else {
      setProjects([]);
      setProjectId('');
    }
  }, [clientId]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    // Recalculate amount
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = Number(newItems[index].quantity) * Number(newItems[index].unitPrice);
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, item) => acc + item.amount, 0);
  const total = subtotal + (subtotal * (taxRate / 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert("Please select a client");
      return;
    }
    if (items.length === 0 || items.some(i => !i.description.trim())) {
      alert("Please add at least one valid item");
      return;
    }

    setIsSubmitting(true);
    try {
      await QuotationsApi.create({
        clientId,
        projectId: projectId || undefined,
        currency,
        taxRate,
        items
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to create quotation:", error);
      alert("Failed to create quotation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">New Quotation</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="new-quote-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Client *</label>
                <select 
                  value={clientId} 
                  onChange={e => setClientId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project (Optional)</label>
                <select 
                  value={projectId} 
                  onChange={e => setProjectId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-gray-50"
                  disabled={!clientId}
                >
                  <option value="">No Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Currency</label>
                <select 
                  value={currency} 
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tax Rate (%)</label>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxRate}
                  onChange={e => setTaxRate(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Line Items</h3>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <input 
                      type="text" 
                      placeholder="Item description"
                      value={item.description}
                      onChange={e => handleItemChange(index, 'description', e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
                      required
                    />
                    <input 
                      type="number" 
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                      className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
                      required
                    />
                    <input 
                      type="number" 
                      placeholder="Price"
                      min="0"
                      value={item.unitPrice}
                      onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                      className="w-28 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
                      required
                    />
                    <div className="w-24 text-right text-sm font-bold text-gray-900">
                      {item.amount.toLocaleString()}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                type="button"
                onClick={addItem}
                className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#346E3A] hover:text-[#2b592f] transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax ({taxRate}%)</span>
                  <span className="font-semibold text-gray-900">{(subtotal * (taxRate / 100)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span>{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="new-quote-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#FBDF4B] text-gray-900 hover:bg-[#F3D53C] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Quotation'}
          </button>
        </div>

      </div>
    </div>
  );
}
