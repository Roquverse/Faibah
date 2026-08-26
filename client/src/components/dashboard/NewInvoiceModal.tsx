'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ClientsApi, ProjectsApi, InvoicesApi } from '@/lib/api';

export default function NewInvoiceModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [taxRate, setTaxRate] = useState<number | string>('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<any[]>([{ itemName: '', details: '', quantity: 1, unitPrice: '', amount: 0 }]);

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
      const q = newItems[index].quantity === '' ? 0 : Number(newItems[index].quantity);
      const p = newItems[index].unitPrice === '' ? 0 : Number(newItems[index].unitPrice);
      newItems[index].amount = (isNaN(q) ? 0 : q) * (isNaN(p) ? 0 : p);
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { itemName: '', details: '', quantity: 1, unitPrice: '', amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const numericTaxRate = taxRate === '' ? 0 : Number(taxRate);
  const subtotal = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const total = subtotal + (subtotal * ((isNaN(numericTaxRate) ? 0 : numericTaxRate) / 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert("Please select a client");
      return;
    }
    if (items.length === 0 || items.some(i => !i.itemName.trim())) {
      alert("Please add at least one valid item name");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedItems = items.map(item => ({
        description: `${item.itemName}|||${item.details}`,
        quantity: item.quantity === '' ? 0 : Number(item.quantity),
        unitPrice: item.unitPrice === '' ? 0 : Number(item.unitPrice),
        amount: item.amount
      }));

      await InvoicesApi.create({
        clientId,
        projectId: projectId || undefined,
        currency,
        taxRate: taxRate === '' ? 0 : Number(taxRate),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        items: formattedItems
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to create invoice:", error);
      alert("Failed to create invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create Invoice</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="new-invoice-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Client</label>
              <select 
                value={clientId} 
                onChange={e => setClientId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">Select a client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.companyName || c.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project (Optional)</label>
              <select 
                value={projectId} 
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="">Select a project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                placeholder="0"
                value={taxRate}
                onChange={e => setTaxRate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
              <input 
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Line Items</h3>
            
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      className="absolute top-4 right-4 sm:static sm:mb-1.5 p-2 sm:p-1.5 text-gray-400 hover:text-red-500 transition-colors bg-white sm:bg-transparent rounded-lg border border-gray-200 sm:border-transparent disabled:opacity-50"
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
                  <span>Tax ({taxRate || 0}%)</span>
                  <span className="font-semibold text-gray-900">{(subtotal * (numericTaxRate / 100)).toLocaleString()}</span>
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
            form="new-invoice-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#FBDF4B] text-gray-900 hover:bg-[#F3D53C] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>

      </div>
    </div>
  );
}
