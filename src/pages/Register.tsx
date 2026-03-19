import { useState, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { UserPlus, Upload, Camera, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { store } from "@/lib/store";
import CountrySearch from "@/components/CountrySearch";

const WEB3FORMS_KEY = "2b77a360-efe4-4f8c-926e-a6a7a8e05895";

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
    surname: '', firstName: '', otherName: '', email: '',
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

  const [memberData, setMemberData] = useState<any>(null);

  const compressImage = (base64: string, maxWidth = 400): Promise<string> => {
    return new Promise((resolve) => {
      if (!base64) { resolve(''); return; }
      const img = new window.Image();
      img.onload = () => {
        const canvas = window.document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => resolve('');
      img.src = base64;
    });
  };

  const handleSubmit = async () => {
    // Prevent double-click / multiple submissions
    if (submitting) return;

    const missing: string[] = [];
    if (!form.surname.trim()) missing.push('Surname');
    if (!form.firstName.trim()) missing.push('First Name');
    if (!form.email.trim()) missing.push('Email');
    if (!form.countryOfOrigin) missing.push('Country of Origin');
    if (!form.countryOfResidence) missing.push('Country of Residence');
    if (!form.phone.trim()) missing.push('Phone');
    if (!form.gender) missing.push('Gender');
    if (!form.maritalStatus) missing.push('Marital Status');
    if (!form.dobYear) missing.push('Date of Birth');
    if (!form.username.trim()) missing.push('Username');
    if (!form.branchName.trim()) missing.push('Branch Name');
    if (missing.length > 0) {
      toast({ title: `Please fill in: ${missing.join(', ')}`, variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast({ title: "Invalid email address. Please enter a valid email.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    try {
      const dob = form.dobYear ? `${form.dobYear}-${(form.dobMonth || '1').padStart(2, '0')}-${(form.dobDay || '1').padStart(2, '0')}` : '';

      // Compress images to avoid Firestore 1MB document limit
      const compressedPhoto = await compressImage(form.photo);
      const compressedDoc = await compressImage(form.document, 600);

      // Auto-calculate expiry date: 3 months from now
      const now = new Date();
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + 3);
      const expiryStr = expiry.toISOString().split('T')[0]; // YYYY-MM-DD

      const member = await store.addMember({
        surname: form.surname.trim(),
        firstName: form.firstName.trim(),
        otherName: form.otherName.trim(),
        email: form.email.trim(),
        countryOfOrigin: form.countryOfOrigin,
        countryOfResidence: form.countryOfResidence,
        unhcrId: form.unhcrId.trim(),
        phone: form.phone.trim(),
        phoneCode: form.phoneCode,
        gender: form.gender,
        maritalStatus: form.maritalStatus,
        dateOfBirth: dob,
        familySize: Number(form.familySize) || 0,
        photo: compressedPhoto,
        document: compressedDoc,
        paymentCurrency: form.paymentCurrency,
        paymentAmount: Number(form.paymentAmount) || 0,
        registrationDate: now.toISOString(),
        expiryDate: expiryStr,
        branchName: form.branchName.trim(),
        username: form.username.trim(),
      });
      setSubmitting(false);
      if (member) {
        // Send email notification to admin about new registration
        try {
          const fullName = `${form.surname} ${form.firstName} ${form.otherName}`.trim();
          await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_key: WEB3FORMS_KEY,
              subject: `New Member Registration - ${fullName}`,
              from_name: fullName,
              email: form.email.trim() || "no-email@refan.org",
              message: `A new member has registered on the ReFAN website.\n\nName: ${fullName}\nReg Number: ${member.regNumber}\nEmail: ${form.email.trim() || 'Not provided'}\nPhone: ${form.phoneCode} ${form.phone.trim()}\nGender: ${form.gender}\nCountry of Origin: ${form.countryOfOrigin}\nCountry of Residence: ${form.countryOfResidence}\nBranch: ${form.branchName.trim()}\nExpiry Date: ${expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
            }),
          });
        } catch {
          // Email notification failure should not block registration success
        }
        setRegNumber(member.regNumber);
        setMemberData({
          name: `${form.surname} ${form.firstName} ${form.otherName}`.trim(),
          email: form.email,
          phone: form.phoneCode + ' ' + form.phone,
          gender: form.gender,
          countryOfOrigin: form.countryOfOrigin,
          countryOfResidence: form.countryOfResidence,
          dob: dob ? `${form.dobDay}/${form.dobMonth}/${form.dobYear}` : '',
          branch: form.branchName,
          photo: compressedPhoto,
          registrationDate: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          expiryDate: expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        });
        setSuccess(true);
        toast({ title: "Member registered successfully!" });
      } else {
        toast({ title: "Registration failed. Please try again.", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setSubmitting(false);
      toast({ title: "An error occurred. Please try again.", variant: "destructive" });
    }
  };

  if (success && memberData) {
    return (
      <Layout>
        <section className="container py-20 max-w-xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="font-heading text-3xl font-extrabold mb-2">Registration Successful!</h1>
            <p className="text-muted-foreground">Welcome to the ReFAN family.</p>
          </div>
          <div className="bg-card rounded-2xl p-8 shadow-elevated space-y-5">
            {/* Member photo & reg number */}
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              {memberData.photo ? (
                <img src={memberData.photo} alt="Member" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <p className="font-heading text-xl font-bold">{memberData.name}</p>
                <p className="text-primary font-bold text-2xl">{regNumber}</p>
                <p className="text-xs text-muted-foreground">Member Registration Number</p>
              </div>
            </div>

            {/* Member details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {memberData.email && (
                <>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{memberData.email}</p>
                </>
              )}
              {memberData.phone.trim() && (
                <>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{memberData.phone}</p>
                </>
              )}
              <p className="text-muted-foreground">Gender</p>
              <p className="font-medium">{memberData.gender}</p>
              <p className="text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{memberData.dob}</p>
              <p className="text-muted-foreground">Country of Origin</p>
              <p className="font-medium">{memberData.countryOfOrigin}</p>
              <p className="text-muted-foreground">Country of Residence</p>
              <p className="font-medium">{memberData.countryOfResidence}</p>
              <p className="text-muted-foreground">Branch</p>
              <p className="font-medium">{memberData.branch}</p>
            </div>

            {/* Membership info */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p className="text-muted-foreground">Registration Date</p>
                <p className="font-medium">{memberData.registrationDate}</p>
                <p className="text-muted-foreground">Membership Expires</p>
                <p className="font-medium text-red-600">{memberData.expiryDate}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                <p className="text-sm font-bold text-amber-800">Membership Term: 3 Months</p>
                <p className="text-xs text-amber-700">Registration fee: 1,000 MWK | Term fee: 2,000 MWK</p>
                <p className="text-xs text-amber-700 mt-1">Your membership will expire on <strong>{memberData.expiryDate}</strong>. Contact admin to renew.</p>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground bg-muted p-3 rounded-lg">Please save or screenshot your registration number <strong className="text-primary">{regNumber}</strong> for your records.</p>
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
          <div className="bg-card rounded-2xl p-8 lg:p-10 shadow-elevated space-y-6">
            {/* Names */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Surname *</label>
                <input value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} className={inputClass} maxLength={100} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">First Name *</label>
                <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={inputClass} maxLength={100} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Other Name</label>
                <input value={form.otherName} onChange={e => setForm({ ...form, otherName: e.target.value })} className={inputClass} maxLength={100} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="your@email.com" maxLength={200} />
            </div>

            {/* Country of origin */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Country of Origin *</label>
                <CountrySearch
                  value={form.countryOfOrigin}
                  onChange={(val) => setForm({ ...form, countryOfOrigin: val })}
                  placeholder="Type to search country..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Country of Residence *</label>
                <CountrySearch
                  value={form.countryOfResidence}
                  onChange={(val) => setForm({ ...form, countryOfResidence: val })}
                  placeholder="Type to search country..."
                />
              </div>
            </div>

            {/* ID Number */}
            <div>
              <label className="block text-sm font-medium mb-1.5">UNHCR ID / National ID / Any Valid ID</label>
              <input value={form.unhcrId} onChange={e => setForm({ ...form, unhcrId: e.target.value })} className={inputClass} maxLength={50} placeholder="Enter your UNHCR ID, National ID, Passport or any valid ID number" />
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
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className={selectClass}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Marital Status *</label>
                <select value={form.maritalStatus} onChange={e => setForm({ ...form, maritalStatus: e.target.value })} className={selectClass}>
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
                <select value={form.dobYear} onChange={e => setForm({ ...form, dobYear: e.target.value })} className={selectClass}>
                  <option value="">Year</option>
                  {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                </select>
                <select value={form.dobMonth} onChange={e => setForm({ ...form, dobMonth: e.target.value })} className={selectClass}>
                  <option value="">Month</option>
                  {months.map((m, i) => <option key={m} value={String(i + 1)}>{m}</option>)}
                </select>
                <select value={form.dobDay} onChange={e => setForm({ ...form, dobDay: e.target.value })} className={selectClass}>
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

            {/* Membership term info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-1">
              <p className="text-sm font-bold text-blue-800">Membership Information</p>
              <p className="text-xs text-blue-700">Registration fee: <strong>1,000 MWK</strong> | Term fee: <strong>2,000 MWK</strong></p>
              <p className="text-xs text-blue-700">Membership term: <strong>3 months</strong> from the date of registration</p>
              <p className="text-xs text-blue-700">Your membership will expire on: <strong>{(() => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); })()}</strong></p>
            </div>

            <Button type="button" onClick={handleSubmit} size="lg" className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-lg" disabled={submitting}>
              <UserPlus className="h-5 w-5" />
              {submitting ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
