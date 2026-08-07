import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { 
  Stethoscope, FileText, Pill, ShoppingBag, TrendingUp, CalendarCheck, 
  ArrowRight, ShieldCheck, HeartPulse, Activity
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar />

      <main>
        {/* 1. HERO SECTION */}
        <section className="relative pt-24 pb-32 overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white opacity-70"></div>
          
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold text-sm mb-6 border border-blue-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  AI-Powered Healthcare Platform
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                  Intelligent Healthcare. <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Connected Care.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  MediPilot AI brings AI-powered consultation, clinical documentation, medication management, recovery tracking, and patient care into one connected healthcare platform.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link href="/signup" className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2">
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/signin" className="w-full sm:w-auto bg-white text-slate-700 font-bold px-8 py-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center">
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Hero Visual */}
              <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-emerald-50 rounded-[3rem] transform rotate-3 scale-105 blur-2xl opacity-50"></div>
                <div className="relative bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                         <Stethoscope className="text-blue-600 w-6 h-6" />
                       </div>
                       <div>
                         <div className="font-bold text-slate-900">Dr. Sarah Mitchell</div>
                         <div className="text-sm text-slate-500">Cardiology Specialist</div>
                       </div>
                     </div>
                     <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                       Active Session
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 bg-slate-50 p-4 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 mb-1">AI Transcript</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          "Patient reports mild chest discomfort and fatigue over the past 3 days..."
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 mb-1">AI Summary Generated</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Chief complaint noted. Recommended ECG and continued observation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 2. FEATURES SECTION */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Everything You Need for Connected Healthcare
              </h2>
              <p className="text-slate-600 text-lg">
                Our suite of tools empowers doctors and guides patients through every step of the clinical journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <Stethoscope />, title: "AI Speech-to-Text", desc: "Capture doctor-patient conversations and convert them into structured text instantly." },
                { icon: <FileText />, title: "AI Clinical Documentation", desc: "Generate AI-assisted consultation summaries and SOAP notes automatically." },
                { icon: <HeartPulse />, title: "Smart Medication Management", desc: "Manage prescriptions, medication schedules, and adherence in real-time." },
                { icon: <ShoppingBag />, title: "Smart Pharmacy", desc: "Help patients access and purchase doctor-prescribed medicines conveniently." },
                { icon: <TrendingUp />, title: "AI Recovery Tracking", desc: "Track patient recovery progress, symptoms, and medication adherence daily." },
                { icon: <CalendarCheck />, title: "Smart Discharge", desc: "Simplify discharge documents, billing workflows, and follow-up scheduling." }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                From Consultation to Recovery
              </h2>
              <p className="text-slate-600 text-lg">
                A seamless, connected workflow that eliminates friction between clinical visits and home care.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="relative">
                <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-100 via-blue-200 to-blue-100"></div>
                
                {[
                  { title: "Doctor Consultation", desc: "Patient meets with the doctor." },
                  { title: "AI Speech-to-Text & Documentation", desc: "Conversations are securely transcribed and summarized into SOAP notes." },
                  { title: "Prescription & Medication Management", desc: "Digital prescriptions are sent to the patient's secure dashboard." },
                  { title: "Recovery Tracking", desc: "Patients report daily progress and adherence via the app." },
                  { title: "Follow-up & Smart Discharge", desc: "Streamlined billing, documents, and continuous care planning." }
                ].map((step, idx) => (
                  <div key={idx} className={`flex flex-col md:flex-row items-center justify-between mb-12 relative ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="hidden md:flex absolute left-[50%] -translate-x-1/2 w-8 h-8 rounded-full bg-white border-4 border-blue-500 items-center justify-center z-10"></div>
                    <div className={`w-full md:w-[45%] bg-slate-50 border border-slate-200 p-6 rounded-2xl ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right text-left'}`}>
                      <div className="text-blue-600 font-bold text-sm mb-2 uppercase tracking-wider">Step 0{idx + 1}</div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
                      <p className="text-slate-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. DOCTOR + PATIENT SECTION */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent"></div>
          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Doctor Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-10 rounded-[2.5rem] hover:border-blue-500/50 transition-colors">
                <h3 className="text-3xl font-bold mb-4">For Doctors</h3>
                <p className="text-slate-400 mb-8 text-lg">Powerful tools for modern clinical workflows.</p>
                
                <ul className="space-y-4 mb-10">
                  {["AI Speech-to-Text", "AI Summary", "SOAP Notes", "Patient Management", "Prescriptions", "Medication Management", "Smart Discharge"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <Link href="/signin" className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors">
                  Sign In as Doctor <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Patient Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-10 rounded-[2.5rem] hover:border-emerald-500/50 transition-colors">
                <h3 className="text-3xl font-bold mb-4">For Patients</h3>
                <p className="text-slate-400 mb-8 text-lg">Everything you need to manage your healthcare journey.</p>
                
                <ul className="space-y-4 mb-10">
                  {["Medical Reports", "Consultation Timeline", "Prescriptions", "Medication Schedule", "Medicine Orders", "Bills & Payments", "Recovery Tracking", "Discharge Documents"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <Link href="/signin" className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-500 transition-colors">
                  Sign In as Patient <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* 5. WHY MEDIPILOT AI */}
        <section id="why-medipilot" className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-8 text-center max-w-4xl">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              One Connected Healthcare Journey
            </h2>
            <p className="text-slate-600 text-lg md:text-xl leading-relaxed mb-16">
              From the moment you step into the clinic until you are fully recovered at home, MediPilot AI ensures that your medical data, prescriptions, and recovery tracking are seamlessly integrated.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-4 text-slate-800 font-bold">
               <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full">Consultation</div>
               <ArrowRight className="w-4 h-4 text-slate-400" />
               <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full">Documentation</div>
               <ArrowRight className="w-4 h-4 text-slate-400" />
               <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full">Prescription</div>
               <ArrowRight className="w-4 h-4 text-slate-400" />
               <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full">Medication</div>
               <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />
               <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full">Recovery</div>
               <ArrowRight className="w-4 h-4 text-slate-400 hidden md:block" />
               <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full">Discharge</div>
            </div>
          </div>
        </section>

        {/* 6. FINAL CTA */}
        <section className="py-24 bg-blue-600">
          <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Experience Connected Healthcare
            </h2>
            <p className="text-blue-100 text-lg md:text-xl mb-12">
              Bring consultation, documentation, medication management, recovery, and patient care together with MediPilot AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 hover:shadow-lg transition-all">
                Create Account
              </Link>
              <Link href="/signin" className="w-full sm:w-auto bg-blue-700 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-800 transition-all border border-blue-500">
                Sign In
              </Link>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
