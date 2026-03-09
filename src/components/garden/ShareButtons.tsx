import { Share2, Twitter, Facebook, Link2 } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  text: string;
  wynKoins?: number;
}

const ShareButtons = ({ title, text, wynKoins }: ShareButtonsProps) => {
  const shareText = wynKoins
    ? `${text} I earned ${wynKoins} WYN-KOINs! 🌸✨`
    : `${text} 🌸`;

  const shareUrl = window.location.origin;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
      toast.success("Copied to clipboard! 🌸");
    }).catch(() => {
      toast.error("Failed to copy");
    });
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={handleNativeShare}
        className="p-2.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
        title="Share"
      >
        <Share2 className="w-4 h-4 text-primary" />
      </button>
      <button
        onClick={handleTwitter}
        className="p-2.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
        title="Share on X"
      >
        <Twitter className="w-4 h-4 text-primary" />
      </button>
      <button
        onClick={handleFacebook}
        className="p-2.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
        title="Share on Facebook"
      >
        <Facebook className="w-4 h-4 text-primary" />
      </button>
      <button
        onClick={handleCopyLink}
        className="p-2.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
        title="Copy link"
      >
        <Link2 className="w-4 h-4 text-primary" />
      </button>
    </div>
  );
};

export default ShareButtons;
