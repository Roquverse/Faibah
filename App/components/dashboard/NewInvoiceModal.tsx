'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ClientsApi, ProjectsApi, InvoicesApi } from '@/lib/api';

export default function NewInvoiceModal({ isOpen, onClose, onSuccess, invoiceToEdit }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, invoiceToEdit?: any }) {
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [taxRate, setTaxRate] = useState<number | string>('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<any[]>([{ itemName: '', details: '', quantity: 1, unitPrice: '', amount: 0, isSubscription: false, subscriptionFrequency: 'MONTHLY', subscriptionDate: '' }]);

  useEffect(() => {
    if (isOpen) {
      ClientsApi.getAll().then(setClients).catch(console.error);
      
      if (invoiceToEdit) {
        setClientId(invoiceToEdit.clientId || '');
        setProjectId(invoiceToEdit.projectId || '');
        setCurrency(invoiceToEdit.currency || 'NGN');
        setTaxRate(invoiceToEdit.taxRate || 0);
        setDueDate(invoiceToEdit.dueDate ? new Date(invoiceToEdit.dueDate).toISOString().split('T')[0] : '');
        if (invoiceToEdit.items && invoiceToEdit.items.length > 0) {
          setItems(invoiceToEdit.items.map((i: any) => {
            const parts = i.description ? i.description.split('|||') : [''];
            return {
              itemName: parts[0] || '',
              details: parts.length > 1 ? parts.slice(1).join('|||') : '',
              quantity: i.quantity || 1,
              unitPrice: i.unitPrice || 0,
              amount: i.amount || 0,
              isSubscription: false,
              subscriptionFrequency: 'MONTHLY',
              subscriptionDate: ''
            };
          }));
        }
      } else {
        setClientId('');
        setProjectId('');
        setCurrency('NGN');
        setTaxRate('');
        setDueDate('');
        setItems([{ itemName: '', details: '', quantity: 1, unitPrice: '', amount: 0, isSubscription: false, subscriptionFrequency: 'MONTHLY', subscriptionDate: '' }]);
      }
    }
  }, [isOpen, invoiceToEdit]);

  useEffect(() => {
    if (clientId) {
      ProjectsApi.getAll(clientId).then(setProjects).catch(console.error);
    } else {
      setProjects([]);
      setProjectId('');
    }
  }, [clientId]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: string, value: string | number | boolean) => {
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
    setItems([...items, { itemName: '', details: '', quantity: 1, unitPrice: '', amount: 0, isSubscription: false, subscriptionFrequency: 'MONTHLY', subscriptionDate: '' }]);
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
        amount: item.amount,
        isSubscription: item.isSubscription,
        subscriptionFrequency: item.subscriptionFrequency,
        subscriptionDate: item.subscriptionDate ? new Date(item.subscriptionDate).toISOString() : undefined,
      }));

      if (invoiceToEdit) {
        await InvoicesApi.update(invoiceToEdit.id, {
          clientId,
          projectId: projectId || undefined,
          currency,
          taxRate: taxRate === '' ? 0 : Number(taxRate),
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          items: formattedItems
        });
      } else {
        await InvoicesApi.create({
          clientId,
          projectId: projectId || undefined,
          currency,
          taxRate: taxRate === '' ? 0 : Number(taxRate),
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          items: formattedItems
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save invoice:", error);
      alert("Failed to save invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{invoiceToEdit ? 'Edit Invoice' : 'New Invoice'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="new-invoice-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 w-full">
                      <div className="w-full sm:flex-1 space-y-1.5 pr-8 sm:pr-0">
                      <label className="text-xs font-semibold text-gray-700">Item Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Web Development"
                        value={item.itemName}
                        onChange={e => handleItemChange(index, 'itemName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 mb-2"
                        required
                      />
                      <label className="text-xs font-semibold text-gray-700">Description</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Professional service delivered as per project requirements."
                        value={item.details}
                        onChange={e => handleItemChange(index, 'details', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex-1 sm:w-20 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Qty</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div className="flex-1 sm:w-28 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Price</label>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          min="0"
                          value={item.unitPrice}
                          onChange={e => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div className="flex-1 sm:w-24 space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Amount</label>
                        <div className="h-[38px] flex items-center justify-end px-3 text-sm font-bold text-gray-900 bg-white sm:bg-transparent rounded-lg border border-gray-200 sm:border-transparent">
                          {item.amount.toLocaleString()}
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
                    </div>

                    {/* Subscription Checkbox */}
                    <div className="w-full mt-4 pt-4 border-t border-gray-200/60">
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input
                          type="checkbox"
                          checked={item.isSubscription}
                          onChange={e => handleItemChange(index, 'isSubscription', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Make this a Subscription</span>
                      </label>
                      {item.isSubscription && (
                        <div className="flex items-center gap-4 mt-2 mb-2">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Frequency</label>
                            <select
                              value={item.subscriptionFrequency}
                              onChange={e => handleItemChange(index, 'subscriptionFrequency', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                            >
                              <option value="WEEKLY">Weekly</option>
                              <option value="MONTHLY">Monthly</option>
                              <option value="YEARLY">Yearly</option>
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                            <input
                              type="date"
                              value={item.subscriptionDate}
                              onChange={e => handleItemChange(index, 'subscriptionDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                              required={item.isSubscription}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                  </div>
                ))}
              </div>

              <button 
                type="button"
                onClick={addItem}
                className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#0C3B2E] hover:text-[#2b592f] transition-colors"
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
            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#FFBA00] text-gray-900 hover:bg-[#E6A700] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : invoiceToEdit ? 'Save Changes' : 'Create Invoice'}
          </button>
        </div>

      </div>
    </div>
  );
}
