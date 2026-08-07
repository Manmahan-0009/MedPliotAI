import { X, CreditCard, Smartphone, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  title: string;
}

export function PaymentModal({ isOpen, onClose, onSuccess, amount, title }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess();
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        {!isSuccess ? (
          <>
            <div className="modal-header">
              <h3 className="section-title mb-0">Complete Payment</h3>
              <button className="icon-btn" onClick={onClose}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              <div className="payment-summary mb-4 bg-background p-4 rounded-md">
                <p className="text-muted text-sm">{title}</p>
                <p className="font-bold text-2xl mt-1">₹{amount}</p>
              </div>

              <div className="payment-methods">
                <p className="font-medium mb-2">Select Payment Method</p>
                
                <label className="payment-method-card">
                  <input type="radio" name="payment" defaultChecked />
                  <div className="method-details flex items-center gap-3">
                    <CreditCard size={20} className="text-primary" />
                    <span>Credit / Debit Card</span>
                  </div>
                </label>

                <label className="payment-method-card">
                  <input type="radio" name="payment" />
                  <div className="method-details flex items-center gap-3">
                    <Smartphone size={20} className="text-primary" />
                    <span>UPI (GPay, PhonePe)</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="modal-footer mt-6 flex gap-2">
              <button className="btn btn-secondary flex-1" onClick={onClose}>Cancel</button>
              <button 
                className="btn btn-primary flex-2" 
                onClick={handlePay}
                disabled={isProcessing}
                style={{ flex: 2 }}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${amount}`}
              </button>
            </div>
          </>
        ) : (
          <div className="success-state text-center py-6">
            <CheckCircle size={64} className="text-success mx-auto mb-4" />
            <h3 className="section-title mb-2">Payment Successful!</h3>
            <p className="text-muted">Your transaction of ₹{amount} has been completed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
