import lazoIcon from "../assets/branding/lazo-icon.png";
import lazoLogoLight from "../assets/branding/lazo-logo-light.png";
import lazoLogoMain from "../assets/branding/lazo-logo-main.png";

type BrandVariant = "main" | "light" | "icon";

type BrandMarkProps = {
  variant?: BrandVariant;
  className?: string;
  alt?: string;
};

const brandAssets: Record<BrandVariant, string> = {
  main: lazoLogoMain,
  light: lazoLogoLight,
  icon: lazoIcon,
};

export default function BrandMark({
  variant = "main",
  className = "",
  alt = "Lazo",
}: BrandMarkProps) {
  return (
    <img
      src={brandAssets[variant]}
      alt={alt}
      className={className}
      draggable={false}
    />
  );
}
