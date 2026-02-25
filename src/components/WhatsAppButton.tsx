import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "265997561852";
const MESSAGE = "Hello ReFAN! I'd like to learn more about your programs in Dzaleka Refugee Camp.";

const WhatsAppButton = () => {
  // Use api.whatsapp.com for direct chat - opens WhatsApp app directly
  const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BD5A] text-white p-4 rounded-full shadow-elevated transition-all hover:scale-110 hover:shadow-2xl"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
};

export default WhatsAppButton;
