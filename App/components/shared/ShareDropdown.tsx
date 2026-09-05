'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Share2, Mail, MessageCircle, Link as LinkIcon, Check, ChevronDown } from 'lucide-react';

interface ShareDropdownProps {
  itemType: 'Invoice' | 'Proposal' | 'Receipt';
  itemRef: string;
  publicUrl: string;
  client?: {
    name?: string | null;
    email?: string | null;
    whatsappNumber?: string | null;
  } | null;
  triggerClassName?: string;
  align?: 'left' | 'right';
}

export default function ShareDropdown({
  itemType,
  itemRef,
  publicUrl,
  client,
  triggerClassName = '',
  align = 'right'
}: ShareDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getMessageText = () => {
    const clientName = client?.name ? client.name.split(' ')[0] : 'there';
    return `Hi ${clientName},\n\nHere is your ${itemType.toLowerCase()} (${itemRef}). You can view it securely using the link below:\n\n${publicUrl}\n\nThank you for your business!`;
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(getMessageText());
    let url = `https://wa.me/?text=${text}`;
    
    if (client?.whatsappNumber) {
      // Remove any spaces or non-digit characters except +
      const cleanNumber = client.whatsappNumber.replace(/[^\d+]/g, '');
      url = `https://wa.me/${cleanNumber}?text=${text}`;
    }
    
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Your ${itemType} (${itemRef})`);
    const body = encodeURIComponent(getMessageText());
    let url = `mailto:?subject=${subject}&body=${body}`;
    
    if (client?.email) {
      url = `mailto:${client.email}?subject=${subject}&body=${body}`;
    }
    
    window.location.href = url;
    setIsOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${triggerClassName} flex items-center justify-center gap-2 bg-[#FFBA00] text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#E6A700] transition-colors border border-transparent whitespace-nowrap`}
      >
        <Share2 className="w-4 h-4" />
        Share
        <ChevronDown className="w-4 h-4 ml-1" />
      </button>

      {isOpen && (
        <div 
          className={`absolute z-50 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          <div className="py-1">
            <button
              onClick={handleWhatsApp}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <MessageCircle className="mr-3 h-4 w-4 text-green-600" />
              Send via WhatsApp
            </button>
            <button
              onClick={handleEmail}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Mail className="mr-3 h-4 w-4 text-blue-600" />
              Send via Email
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={handleCopy}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              {copied ? (
                <Check className="mr-3 h-4 w-4 text-green-500" />
              ) : (
                <LinkIcon className="mr-3 h-4 w-4 text-gray-400" />
              )}
              {copied ? 'Copied!' : 'Copy Public Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
