import { useState, useRef, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { UserPlus, Upload, Camera, CheckCircle, CreditCard, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { store, DEFAULT_MEMBERSHIP_FEES, DEFAULT_DONATE_PAY_LINK, type MembershipSettings, type DonateSettings } from "@/lib/store";
import { toHref } from "@/lib/contactLinks";
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
  const [fees, setFees] = useState<MembershipSettings>(DEFAULT_MEMBERSHIP_FEES);
  const [payLink, setPayLink] = useState(DEFAULT_DONATE_PAY_LINK);
  const [redirectingName, setRedirectingName] = useState<string | null>(null);

  useEffect(() => {
    store.getPageSettings<MembershipSettings>("membership").then((data) => {
      if (data) setFees({ ...DEFAULT_MEMBERSHIP_FEES, ...data });
    });
    // Same DzalekaPay checkout the Donate page uses (admin sets it under Page Content > Donate).
    store.getPageSettings<DonateSettings>("donate").then((data) => {
      if (data && typeof data.payLink === "string") setPayLink(data.payLink);
    });
  }, []);

  const registrationFee = Math.max(0, Number(fees.registrationFee) || 0);
  const termFee = Math.max(0, Number(fees.termFee) || 0);
  const totalFee = registrationFee + termFee;
  const payHref = toHref(payLink);
  const formatMwk = (n: number) => `MWK ${n.toLocaleString()}`;

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
        paymentCurrency: 'MWK',
        paymentAmount: totalFee,
        registrationDate: now.toISOString(),
        expiryDate: expiryStr,
        branchName: form.branchName.trim(),
        username: form.username.trim(),
        paymentStatus: 'pending',
      });
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
              message: `A new member has registered on the ReFAN website.\n\nName: ${fullName}\nReg Number: ${member.regNumber}\nEmail: ${form.email.trim() || 'Not provided'}\nPhone: ${form.phoneCode} ${form.phone.trim()}\nGender: ${form.gender}\nCountry of Origin: ${form.countryOfOrigin}\nCountry of Residence: ${form.countryOfResidence}\nBranch: ${form.branchName.trim()}\nMembership fee: ${formatMwk(totalFee)}\nPayment status: PENDING - confirm the payment in DzalekaPay, then approve the member in Admin > Members.`,
            }),
          });
        } catch {
          // Email notification failure should not block registration success
        }
        const fullName = `${form.surname} ${form.firstName} ${form.otherName}`.trim();
        if (totalFee > 0 && payHref) {
          // Thank them, then send them to DzalekaPay with the membership fee prefilled.
          let target = payHref;
          try {
            const url = new URL(payHref);
            url.searchParams.set("amount", String(totalFee));
            target = url.toString();
          } catch { /* keep the link exactly as the admin entered it */ }
          setRedirectingName(form.firstName.trim() || fullName);
          setTimeout(() => { window.location.href = target; }, 3500);
          return;
        }
        setSubmitting(false);
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
        setSubmitting(false);
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
          <div className="bg-card rounded-2xl p-8 shadow-elevated text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="font-heading text-3xl font-extrabold">Thank you, {memberData.name}!</h1>
            <p className="text-muted-foreground">Your registration has been received.</p>
            <p className="text-muted-foreground">
              Once our team confirms your membership, you will receive an email at <strong className="text-foreground">{memberData.email}</strong> with your membership number.
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {redirectingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-elevated p-8 max-w-md w-full text-center space-y-3">
            <Heart className="h-10 w-10 text-primary mx-auto" />
            <h2 className="font-heading text-2xl font-bold">Thank you, {redirectingName}!</h2>
            <p className="text-muted-foreground">Your registration has been received. Taking you to our secure payment page to pay {formatMwk(totalFee)}…</p>
            <p className="text-xs text-muted-foreground">After your payment is confirmed, you will receive your membership number by email.</p>
            <div className="h-6 w-6 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        </div>
      )}
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

            {/* Membership fee (set by the admin; paid in MWK on DzalekaPay) */}
            <div className="rounded-lg border border-border p-4 space-y-1 text-sm">
              <p className="font-medium mb-1">Membership Fee</p>
              {registrationFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Registration fee</span><span>{formatMwk(registrationFee)}</span></div>}
              {termFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Term fee (3 months)</span><span>{formatMwk(termFee)}</span></div>}
              <div className="flex justify-between font-bold border-t border-border pt-2 mt-2"><span>Total</span><span className="text-primary">{totalFee > 0 ? formatMwk(totalFee) : 'Free'}</span></div>
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
              <p className="text-xs text-blue-700">Registration fee: <strong>{formatMwk(registrationFee)}</strong> | Term fee: <strong>{formatMwk(termFee)}</strong></p>
              <p className="text-xs text-blue-700">Membership term: <strong>3 months</strong> from the date your membership is confirmed</p>
              <p className="text-xs text-blue-700">You become a member once our team confirms your payment. You will then receive your membership number by email.</p>
            </div>

            <Button type="button" onClick={handleSubmit} size="lg" className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-lg" disabled={submitting}>
              {totalFee > 0 && payHref ? <CreditCard className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              {submitting ? 'Registering...' : totalFee > 0 && payHref ? `Register & Pay ${formatMwk(totalFee)}` : 'Register'}
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
