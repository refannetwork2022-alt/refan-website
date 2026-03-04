import { Link } from "react-router-dom";

interface MaintenancePageProps {
  message?: string;
}

const MaintenancePage = ({ message }: MaintenancePageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary text-white px-4">
      <div className="text-center max-w-md space-y-6">
        <img src="/logo.png" alt="ReFAN" className="w-20 h-20 mx-auto opacity-80" />
        <h1 className="font-heading text-3xl font-extrabold">
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
        <Link
          to="/admin-login"
          className="inline-block text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Admin
        </Link>
      </div>
    </div>
  );
};

export default MaintenancePage;
