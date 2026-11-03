import { ArrowUpRight } from "lucide-react";
import Brand from "./Brand";

interface Props {
  onHome: () => void;
  onAbout: () => void;
  onPrivacy: () => void;
  onDisclaimer: () => void;
}
export default function Footer({
  onHome,
  onAbout,
  onPrivacy,
  onDisclaimer,
}: Props) {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand-block">
          <Brand onClick={onHome} />
          <p className="footer-creator">
            Created by <strong>Nancy Okereke.</strong>
          </p>
          <p>
            A free resource to help businesses establish
            <br className="desktop-break" /> responsible AI practices and
            protect their information.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <span className="footer-label">EXPLORE</span>
            <button onClick={onAbout}>About</button>
            <a
              href="https://linkedin.com/in/nancyokereke"
              target="_blank"
              rel="noopener noreferrer"
            >
              Connect with Nancy <ArrowUpRight size={14} />
              <span className="sr-only"> on LinkedIn (opens a new tab)</span>
            </a>
          </div>
          <div>
            <span className="footer-label">GOOD TO KNOW</span>
            <button onClick={onPrivacy}>Privacy Notice</button>
            <button onClick={onDisclaimer}>Disclaimer</button>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© 2026 AI Policy Builder. Created by Nancy Okereke.</p>
        <span>
          <span className="status-dot" /> Thoughtfully built. Freely shared.
        </span>
      </div>
    </footer>
  );
}
