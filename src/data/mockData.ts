export const patient = {
  id: "pat_123",
  name: "Arjun Kumar",
  age: 45,
  gender: "Male",
  bloodGroup: "O+",
  allergies: ["Penicillin", "Dust"],
  emergencyContact: {
    name: "Priya Kumar (Wife)",
    phone: "+91 9876543210"
  },
  conditions: ["Type 2 Diabetes", "Hypertension"]
};

export const healthOverview = {
  recoveryScore: 82,
  recoveryTrend: "improving",
  adherencePercentage: 92,
  nextMedicine: {
    time: "2 hours",
    name: "Metformin 500mg"
  },
  nextFollowUp: "12 August 2026",
  outstandingBill: 0
};

export const timelineEvents = [
  {
    id: 1,
    date: "07 August 2026",
    time: "09:30 AM",
    type: "consultation",
    title: "Consultation Completed",
    description: "Dr. Sharma completed the online consultation.",
    status: "completed"
  },
  {
    id: 2,
    date: "07 August 2026",
    time: "09:45 AM",
    type: "documentation",
    title: "AI Documentation",
    description: "Conversation summary and SOAP notes generated.",
    status: "completed"
  },
  {
    id: 3,
    date: "07 August 2026",
    time: "09:50 AM",
    type: "prescription",
    title: "Prescription Created",
    description: "3 medicines prescribed by Dr. Sharma.",
    status: "completed"
  },
  {
    id: 4,
    date: "07 August 2026",
    time: "10:00 AM",
    type: "medication_schedule",
    title: "Medication Schedule Created",
    description: "Medication instructions are now available in your dashboard.",
    status: "completed"
  },
  {
    id: 5,
    date: "07 August 2026",
    time: "10:15 AM",
    type: "pharmacy",
    title: "Medicine Order",
    description: "Medicines ordered from Smart Pharmacy.",
    status: "completed"
  },
  {
    id: 6,
    date: "07 August 2026",
    time: "10:20 AM",
    type: "payment",
    title: "Payment",
    description: "₹1,240 paid for medicine order.",
    status: "completed"
  },
  {
    id: 7,
    date: "07 August 2026",
    time: "11:00 AM",
    type: "discharge",
    title: "Discharge Completed",
    description: "Discharge process finalized.",
    status: "completed"
  },
  {
    id: 8,
    date: "12 August 2026",
    time: "10:30 AM",
    type: "followup",
    title: "Follow-up Appointment",
    description: "Scheduled with Dr. Sharma.",
    status: "pending"
  }
];

export const medications = [
  {
    id: "med_1",
    name: "Metformin 500mg",
    dosage: "1 tablet",
    frequency: "Twice daily",
    timing: "After breakfast and after dinner",
    duration: "30 days",
    prescribedQty: 60,
    remainingQty: 54,
    status: "active",
    doctor: "Dr. Sharma",
    date: "07 Aug 2026",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
    genericAlternative: {
      name: "Glycomet 500",
      savings: 120
    }
  },
  {
    id: "med_2",
    name: "Amlodipine 5mg",
    dosage: "1 tablet",
    frequency: "Once daily",
    timing: "Before breakfast",
    duration: "30 days",
    prescribedQty: 30,
    remainingQty: 27,
    status: "active",
    doctor: "Dr. Sharma",
    date: "07 Aug 2026",
    imageUrl: "https://images.unsplash.com/photo-1550572017-edb3034989cd?w=400&q=80",
    genericAlternative: null
  },
  {
    id: "med_3",
    name: "Paracetamol 500mg",
    dosage: "1 tablet",
    frequency: "As needed",
    timing: "For fever or pain",
    duration: "5 days",
    prescribedQty: 10,
    remainingQty: 10,
    status: "active",
    doctor: "Dr. Sharma",
    date: "07 Aug 2026",
    imageUrl: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&q=80",
    genericAlternative: {
      name: "Crocin 500",
      savings: 15
    }
  }
];

export const billsData = [
  { id: 'INV-001', date: '07 Aug 2026', type: 'Medicine Purchase', amount: 1240, status: 'Paid' },
  { id: 'INV-002', date: '07 Aug 2026', type: 'Consultation Fee', amount: 800, status: 'Paid' },
  { id: 'INV-003', date: '08 Aug 2026', type: 'Discharge Bill (Dr. Sharma)', amount: 8450, status: 'Pending' }
];

export const consultations = [
  {
    id: "cons_1",
    doctor: "Dr. Sharma",
    specialty: "General Physician",
    date: "07 Aug 2026",
    time: "09:30 AM",
    reason: "Routine follow-up for Diabetes and BP",
    status: "Completed",
    hasSummary: true,
    hasSoap: true,
    hasPrescription: true
  },
  {
    id: "cons_2",
    doctor: "Dr. Verma",
    specialty: "Cardiologist",
    date: "15 Jun 2026",
    time: "11:00 AM",
    reason: "Chest pain assessment",
    status: "Completed",
    hasSummary: true,
    hasSoap: true,
    hasPrescription: true
  }
];

export const documents = [
  { id: "doc_1", title: "Consultation Report", date: "07 Aug 2026", type: "report" },
  { id: "doc_2", title: "AI Conversation Summary", date: "07 Aug 2026", type: "summary" },
  { id: "doc_3", title: "SOAP Notes", date: "07 Aug 2026", type: "clinical" },
  { id: "doc_4", title: "Prescription", date: "07 Aug 2026", type: "prescription" },
  { id: "doc_5", title: "Discharge Summary", date: "07 Aug 2026", type: "discharge" },
  { id: "doc_6", title: "Medicine Invoice", date: "07 Aug 2026", type: "billing" }
];

export const recoveryJourney = [
  { day: 1, title: "Consultation Completed", status: "completed" },
  { day: 3, title: "Medication Started", status: "completed" },
  { day: 7, title: "Symptoms Reduced", status: "completed" },
  { day: 14, title: "Follow-up Completed", status: "pending" },
  { day: 21, title: "Recovery Score Increased to 82", status: "pending" }
];
