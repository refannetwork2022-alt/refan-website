import { useState, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { UserPlus, Upload, Camera, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { store } from "@/lib/store";
import CountrySearch from "@/components/CountrySearch";

const phoneCodes = [
  { code: "+265", country: "MW" }, { code: "+1", country: "US" }, { code: "+44", country: "GB" },
  { code: "+33", country: "FR" }, { code: "+49", country: "DE" }, { code: "+254", country: "KE" },
  { code: "+255", country: "TZ" }, { code: "+256", country: "UG" }, { code: "+250", country: "RW" },
  { code: "+257", country: "BI" }, { code: "+243", country: "CD" }, { code: "+27", country: "ZA" },
  { code: "+91", country: "IN" }, { code: "+86", country: "CN" }, { code: "+61", country: "AU" },
  { code: "+234", country: "NG" }, { code: "+251", country: "ET" }, { code: "+252", country: "SO" },
  { code: "+211", country: "SS" }, { code: "+249", country: "SD" },
];

const currencies = [
  { code: "MWK", label: "MWK (Malawi Kwacha)" },
  { code: "USD", label: "USD (US Dollar)" },
  { code: "GBP", label: "GBP (British Pound)" },
  { code: "EUR", label: "EUR (Euro)" },
  { code: "KES", label: "KES (Kenyan Shilling)" },
  { code: "ZAR", label: "ZAR (South African Rand)" },
  { code: "BIF", label: "BIF (Burundian Franc)" },
  { code: "CDF", label: "CDF (Congolese Franc)" },
  { code: "RWF", label: "RWF (Rwandan Franc)" },
  { code: "TZS", label: "TZS (Tanzanian Shilling)" },
  { code: "UGX", label: "UGX (Ugandan Shilling)" },
];

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const inputClass = "w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none";
const selectClass = inputClass;

const Register = () => {
  const { toast } = useToast();
  const photoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [regNumber, setRegNumber] = useState('');

  const [form, setForm] = useState({
    surname: '', firstName: '', otherName: '',
    countryOfOrigin: '', countryOfResidence: '',
    unhcrId: '', phone: '', phoneCode: '+265',
    gender: '', maritalStatus: '',
    dobYear: '', dobMonth: '', dobDay: '',
    familySize: '',
    photo: '', document: '',
    paymentCurrency: 'MWK', paymentAmount: '',
    branchName: 'Dzaleka', username: '',
  });

  const handleFileToBase64 = (file: File, field: 'photo' | 'document') => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large. Maximum 5MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.surname.trim() || !form.firstName.trim() || !form.countryOfOrigin || !form.countryOfResidence || !form.gender || !form.maritalStatus || !form.dobYear) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const dob = `${form.dobYear}-${form.dobMonth.padStart(2, '0')}-${form.dobDay.padStart(2, '0')}`;
    const member = await store.addMember({
      surname: form.surname.trim(),
      firstName: form.firstName.trim(),
      otherName: form.otherName.trim(),
      countryOfOrigin: form.countryOfOrigin,
      countryOfResidence: form.countryOfResidence,
      unhcrId: form.unhcrId.trim(),
      phone: form.phone.trim(),
      phoneCode: form.phoneCode,
      gender: form.gender,
      maritalStatus: form.maritalStatus,
      dateOfBirth: dob,
      familySize: Number(form.familySize) || 0,
      photo: form.photo,
      document: form.document,
      paymentCurrency: form.paymentCurrency,
      paymentAmount: Number(form.paymentAmount) || 0,
      registrationDate: new Date().toISOString(),
      expiryDate: '',
      branchName: form.branchName.trim(),
      username: form.username.trim(),
    });
    setSubmitting(false);
    if (member) {
      setRegNumber(member.regNumber);
      setSuccess(true);
    } else {
      toast({ title: "Registration failed. Please try again.", variant: "destructive" });
    }
  };

  if (success) {
    return (
      <Layout>
        <section className="container py-20 text-center max-w-xl mx-auto">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="font-heading text-3xl font-extrabold mb-4">Registration Successful!</h1>
          <div className="bg-card rounded-2xl p-8 shadow-elevated text-left space-y-4">
            <p className="text-lg"><strong>Registration Number:</strong> <span className="text-primary font-bold text-xl">{regNumber}</span></p>
            <p className="text-muted-foreground">Please keep this number for your records.</p>
            <div className="border-t border-border pt-4 space-y-2">
              <p><strong>Registration fee:</strong> 1,000 MWK</p>
              <p><strong>Term fee:</strong> 2,000 MWK</p>
              <p className="text-sm text-muted-foreground italic">Registration is only 1,000 Malawi Kwacha. Please contact admin for payment instructions.</p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container pt-12 pb-8 text-center">
        <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mb-3">Register as <span className="text-primary">New Member</span></h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Join the ReFAN community. Fill in your details below to become a registered member.
        </p>
      </section>

      <section className="container py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 lg:p-10 shadow-elevated space-y-6">
            {/* Names */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Surname *</label>
                <input value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} className={inputClass} required maxLength={100} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">First Name *</label>
                <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={inputClass} required maxLength={100} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Other Name</label>
                <input value={form.otherName} onChange={e => setForm({ ...form, otherName: e.target.value })} className={inputClass} maxLength={100} />
              </div>
            </div>

            {/* Country of origin */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Country of Origin *</label>
                <CountrySearch
                  value={form.countryOfOrigin}
                  onChange={(val) => setForm({ ...form, countryOfOrigin: val })}
                  placeholder="Type to search country..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Country of Residence *</label>
                <CountrySearch
                  value={form.countryOfResidence}
                  onChange={(val) => setForm({ ...form, countryOfResidence: val })}
                  placeholder="Type to search country..."
                  required
                />
              </div>
            </div>

            {/* UNHCR ID */}
            <div>
              <label className="block text-sm font-medium mb-1.5">UNHCR ID</label>
              <input value={form.unhcrId} onChange={e => setForm({ ...form, unhcrId: e.target.value })} className={inputClass} maxLength={50} placeholder="Enter your UNHCR ID or any valid ID" />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone Number</label>
              <div className="flex gap-2">
                <select value={form.phoneCode} onChange={e => setForm({ ...form, phoneCode: e.target.value })} className="w-32 px-3 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none text-sm">
                  {phoneCodes.map(p => <option key={p.code} value={p.code}>{p.country} ({p.code})</option>)}
                </select>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="Write your number without country code" maxLength={15} />
              </div>
            </div>

            {/* Gender + Marital Status */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Gender *</label>
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className={selectClass} required>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Marital Status *</label>
                <select value={form.maritalStatus} onChange={e => setForm({ ...form, maritalStatus: e.target.value })} className={selectClass} required>
                  <option value="">Select status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Date of Birth *</label>
              <div className="grid grid-cols-3 gap-3">
                <select value={form.dobYear} onChange={e => setForm({ ...form, dobYear: e.target.value })} className={selectClass} required>
                  <option value="">Year</option>
                  {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                </select>
                <select value={form.dobMonth} onChange={e => setForm({ ...form, dobMonth: e.target.value })} className={selectClass} required>
                  <option value="">Month</option>
                  {months.map((m, i) => <option key={m} value={String(i + 1)}>{m}</option>)}
                </select>
                <select value={form.dobDay} onChange={e => setForm({ ...form, dobDay: e.target.value })} className={selectClass} required>
                  <option value="">Day</option>
                  {days.map(d => <option key={d} value={String(d)}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Family Size */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Family Size</label>
              <input type="number" value={form.familySize} onChange={e => setForm({ ...form, familySize: e.target.value })} className={inputClass} min={0} max={50} />
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Profile Photo</label>
              <div className="flex items-center gap-4">
                {form.photo && <img src={form.photo} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-border" />}
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileToBase64(e.target.files[0], 'photo')} />
                <Button type="button" variant="outline" onClick={() => photoRef.current?.click()}>
                  <Camera className="h-4 w-4" /> Upload Photo
                </Button>
              </div>
            </div>

            {/* Document upload */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Upload Factsheet / Refugee Proof or Document</label>
              <div className="flex items-center gap-4">
                {form.document && <span className="text-sm text-green-600 font-medium">Document uploaded</span>}
                <input ref={docRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFileToBase64(e.target.files[0], 'document')} />
                <Button type="button" variant="outline" onClick={() => docRef.current?.click()}>
                  <Upload className="h-4 w-4" /> Upload Document
                </Button>
              </div>
            </div>

            {/* Payment */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Make Your Payment In</label>
              <div className="grid sm:grid-cols-2 gap-4">
                <select value={form.paymentCurrency} onChange={e => setForm({ ...form, paymentCurrency: e.target.value })} className={selectClass}>
                  {currencies.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                <input type="number" value={form.paymentAmount} onChange={e => setForm({ ...form, paymentAmount: e.target.value })} className={inputClass} placeholder="Amount" min={0} />
              </div>
              <p className="text-xs text-primary font-medium mt-2 italic">Registration is only 1,000 Malawi Kwacha</p>
            </div>

            {/* Username + Branch */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Username</label>
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className={inputClass} maxLength={50} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Branch Name</label>
                <input value={form.branchName} onChange={e => setForm({ ...form, branchName: e.target.value })} className={inputClass} maxLength={100} />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-lg" disabled={submitting}>
              <UserPlus className="h-5 w-5" />
              {submitting ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
