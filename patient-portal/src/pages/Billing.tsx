import { useState } from 'react';
import { Download, Eye, AlertCircle } from 'lucide-react';
import { billsData } from '../data/mockData';
import { PaymentModal } from '../components/PaymentModal';

export function Billing() {
  const [bills, setBills] = useState(billsData);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activePayment, setActivePayment] = useState<{ id: string, amount: number, title: string } | null>(null);

  const handlePayClick = (bill: any) => {
    setActivePayment({
      id: bill.id,
      amount: bill.amount,
      title: bill.type
    });
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = () => {
    if (activePayment) {
      setBills(prevBills => 
        prevBills.map(bill => 
          bill.id === activePayment.id ? { ...bill, status: 'Paid' } : bill
        )
      );
    }
  };

  const pendingBills = bills.filter(b => b.status === 'Pending');

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h1 className="section-title mb-0" style={{ fontSize: '1.8rem' }}>Bills & Payments</h1>
          <p className="text-muted mt-1">Manage your invoices and payment history.</p>
        </div>
      </div>

      {pendingBills.length > 0 && (
        <div className="card mb-6 highlight-card border-warning">
          <div className="flex items-center gap-3 text-warning mb-4 pb-4 border-bottom">
            <AlertCircle size={24} />
            <h2 className="section-title mb-0" style={{ color: 'inherit' }}>Pending Payments</h2>
          </div>
          
          {pendingBills.map(bill => (
            <div key={bill.id} className="flex-between">
              <div>
                <h3 className="font-bold text-lg">{bill.type}</h3>
                <p className="text-muted text-sm mt-1">Invoice ID: {bill.id} • Date: {bill.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl mb-2">₹{bill.amount}</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => handlePayClick(bill)}
                >
                  Pay Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="flex-between mb-4 border-bottom pb-4">
          <h2 className="section-title mb-0">Payment History</h2>
          <button className="btn btn-outline">Download All</button>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th className="pb-4 pt-2 text-muted font-medium">Invoice ID</th>
              <th className="pb-4 pt-2 text-muted font-medium">Date</th>
              <th className="pb-4 pt-2 text-muted font-medium">Type</th>
              <th className="pb-4 pt-2 text-muted font-medium">Amount</th>
              <th className="pb-4 pt-2 text-muted font-medium">Status</th>
              <th className="pb-4 pt-2 text-muted font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(bill => (
              <tr key={bill.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td className="py-4 font-medium">{bill.id}</td>
                <td className="py-4 text-muted">{bill.date}</td>
                <td className="py-4">{bill.type}</td>
                <td className="py-4 font-medium">₹{bill.amount}</td>
                <td className="py-4">
                  <span className={`badge ${bill.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                    {bill.status}
                  </span>
                </td>
                <td className="py-4 text-right flex justify-end gap-2" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  {bill.status === 'Pending' ? (
                     <button 
                       className="btn btn-primary btn-sm"
                       onClick={() => handlePayClick(bill)}
                     >
                       Pay Now
                     </button>
                  ) : (
                    <>
                      <button className="btn btn-secondary btn-sm" title="View"><Eye size={16} /></button>
                      <button className="btn btn-secondary btn-sm" title="Download"><Download size={16} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={activePayment?.amount || 0}
        title={activePayment?.title || ''}
      />
    </div>
  );
}
