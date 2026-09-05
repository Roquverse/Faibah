'use client';
import { usePaystackPayment } from 'react-paystack';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
      toast.error('Paystack Public Key is missing or invalid. Please check your .env file.');
      return;
    }
    initializePayment(onSuccess, () => toast.info('Payment window closed.'));
  };

  return (
    <Button onClick={handleClick} disabled={disabled} className={className || "w-full"}>
      {text}
    </Button>
  );
}
