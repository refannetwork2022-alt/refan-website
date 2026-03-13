import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface MaintenancePageProps {
  message?: string;
}

const MaintenancePage = ({ message }: MaintenancePageProps) => {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSecretTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    // Reset tap count after 2 seconds of inactivity
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setTapCount(0), 2000);

    if (newCount >= 5) {
      setTapCount(0);
      navigate("/admin-login");
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary text-white px-4">
      <div className="text-center max-w-md space-y-6">
        <img src="/logo.png" alt="ReFAN" className="w-20 h-20 mx-auto opacity-80" />
        <h1
          className="font-heading text-3xl font-extrabold cursor-default select-none"
          onClick={handleSecretTap}
        >
          <span className="text-primary">ReFA</span>N
        </h1>
        <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
          <h2 className="font-heading text-xl font-bold mb-3">Site Under Maintenance</h2>
          {message ? (
            <div className="text-white/70 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: message }} />
          ) : (
            <p className="text-white/70 text-sm leading-relaxed">
              We are currently updating our website. Please check back soon.
            </p>
          )}
        </div>
        <p className="text-white/20 text-xs select-none">
          &copy; {currentYear} ReFAN
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
