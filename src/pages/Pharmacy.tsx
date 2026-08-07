import { useState } from 'react';
import { medications } from '../data/mockData';
import { ShoppingCart, AlertCircle, TrendingDown } from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';
import './Pharmacy.css';

export function Pharmacy() {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const handlePayOnline = (amount: number) => {
    setPaymentAmount(amount);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    // In a real app, update the backend state here
    console.log("Medicine payment successful!");
  };

  return (
    <div className="pharmacy-container">
      <div className="flex-between mb-6">
        <div>
          <h1 className="section-title mb-0" style={{ fontSize: '1.8rem' }}>Smart Pharmacy</h1>
          <p className="text-muted mt-1">Order your prescribed medicines safely.</p>
        </div>
        <button className="btn btn-primary">
          <ShoppingCart size={18} /> View Cart (0)
        </button>
      </div>

      <div className="card mb-6">
        <h2 className="section-title">Your Prescribed Medicines</h2>
        <div className="pharmacy-grid">
          {medications.map(med => (
            <div key={med.id} className="pharmacy-card">
              {med.imageUrl && (
                <div className="medicine-image-container">
                  <img src={med.imageUrl} alt={med.name} className="medicine-image" />
                </div>
              )}
              <div className="pharmacy-card-header flex-between mt-3">
                <h3 className="med-name">{med.name}</h3>
                <span className="badge badge-primary">Prescribed</span>
              </div>
              <div className="med-details mt-2 pb-4 border-bottom">
                <p>Required Quantity: <strong>{med.prescribedQty} tablets</strong></p>
                <p>Price: <strong>₹{med.prescribedQty * 5}</strong></p>
                <p className="text-muted text-sm mt-1">Prescribed by {med.doctor}</p>
              </div>
              
              {med.genericAlternative && (
                <div className="generic-suggestion mt-4">
                  <div className="flex gap-2 text-success font-medium mb-1 items-center">
                    <TrendingDown size={16} /> Generic Alternative Available
                  </div>
                  <p className="text-sm">{med.genericAlternative.name}</p>
                  <p className="text-sm text-success font-medium">Estimated savings: ₹{med.genericAlternative.savings}</p>
                </div>
              )}
              
              {!med.genericAlternative && (
                <div className="generic-suggestion mt-4 text-muted text-sm flex gap-2 items-center">
                  <AlertCircle size={16} /> No generic alternative recommended.
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <input type="number" defaultValue={med.prescribedQty} className="qty-input flex-1" min="1" max={med.prescribedQty} />
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 2 }}
                  onClick={() => handlePayOnline(med.prescribedQty * 5)}
                >
                  Pay Online
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <p className="disclaimer text-center mt-6">
        Note: You can only order medicines prescribed by your doctor. 
        Alternative options are for demonstration purposes only.
      </p>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={paymentAmount}
        title="Medicine Order Payment"
      />
    </div>
  );
}
