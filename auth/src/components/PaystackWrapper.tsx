'use client';
import { usePaystackPayment } from 'react-paystack';

export default function PaystackWrapper({ email, amount, onSuccess, text, className, disabled }: any) {
  const config = {
    reference: (new Date()).getTime().toString(),
    email: email || 'user@example.com',
    amount: amount,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };

  const initializePayment = usePaystackPayment(config);

  const handleClick = () => {
    if (!config.publicKey || config.publicKey.includes('paste')) {
      alert('Paystack Public Key is missing or invalid. Please check your .env file.');
      return;
    }
    initializePayment(onSuccess, () => console.log('Payment window closed.'));
  };

  return (
    <button onClick={handleClick} disabled={disabled} className={className || "w-full"}>
      {text}
    </button>
  );
}
