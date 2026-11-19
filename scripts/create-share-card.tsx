import { renderToStaticMarkup } from 'react-dom/server';
import BallArt from '@/components/art/BallArt';
import RacquetArt from '@/components/art/RacquetArt';
import ShoeArt from '@/components/art/ShoeArt';

/** Editable, original brand graphic: no third-party product photos or footage. */
export function shareCardSvg() {
  return renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <title>Tried &amp; Kept — Find your next keeper.</title>
      <rect width="1200" height="630" fill="#FFF7E6" />
      <path d="M0 605H1200V630H0Z" fill="#0E2A2A" />
      <svg x="55" y="37" width="58" height="58"><BallArt /></svg>
      <text x="128" y="79" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="35" fill="#0E2A2A">TRIED &amp; KEPT</text>
      <text x="60" y="215" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="83" letterSpacing="-4" fill="#0E2A2A">Find your</text>
      <text x="60" y="310" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="92" letterSpacing="-4" fill="#0E2A2A">next keeper.</text>
      <text x="65" y="370" fontFamily="Arial, sans-serif" fontSize="28" fill="#42605C">Tennis gear, tried for real.</text>
      <g transform="rotate(3 937 284)">
        <rect x="752" y="63" width="379" height="449" rx="29" fill="#0E2A2A" />
        <rect x="741" y="52" width="379" height="449" rx="29" fill="#2F6BFF" stroke="#0E2A2A" strokeWidth="6" />
        <g fill="none" stroke="#FFFFFF" strokeWidth="3" opacity=".45">
          <path d="M772 82H1089V470H772ZM800 82V470M1061 82V470M800 210H1061M800 347H1061M930 210V347" />
          <path d="M772 279H1089" strokeDasharray="8 6" />
        </g>
        <svg x="796" y="85" width="239" height="350"><RacquetArt seed="share-card" frame="#FFF7E6" accent="#FF6A3D" grip="#E6FF3D" tilt={16} /></svg>
        <svg x="997" y="351" width="136" height="136"><BallArt /></svg>
        <svg x="732" y="358" width="300" height="187"><ShoeArt seed="original-share-shoe" main="#FFFFFF" accent="#FF6A3D" detail="#2F6BFF" /></svg>
      </g>
      <g transform="rotate(-4 142 469)">
        <rect x="65" y="434" width="151" height="62" rx="31" fill="#0E2A2A" />
        <rect x="60" y="429" width="151" height="62" rx="31" fill="#9FDFAB" stroke="#0E2A2A" strokeWidth="3" />
        <text x="135" y="469" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="27" fontWeight="900" fill="#0E2A2A">KEPT</text>
      </g>
      <g transform="rotate(3 326 469)">
        <rect x="234" y="434" width="201" height="62" rx="31" fill="#0E2A2A" />
        <rect x="229" y="429" width="201" height="62" rx="31" fill="#FF6A3D" stroke="#0E2A2A" strokeWidth="3" />
        <text x="329" y="469" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="25" fontWeight="900" fill="#0E2A2A">SENT BACK</text>
      </g>
      <g transform="rotate(-3 543 469)">
        <rect x="454" y="434" width="181" height="62" rx="31" fill="#0E2A2A" />
        <rect x="449" y="429" width="181" height="62" rx="31" fill="#E6FF3D" stroke="#0E2A2A" strokeWidth="3" />
        <text x="539" y="469" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="25" fontWeight="900" fill="#0E2A2A">YOUR BAG</text>
      </g>
      <text x="65" y="561" fontFamily="Arial, sans-serif" fontSize="21" fill="#42605C">Compare gear. Build your bag. Share what works.</text>
    </svg>
  );
}
