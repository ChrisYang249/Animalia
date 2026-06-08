import './AnimaliaLogo.css';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg';

interface AnimaliaLogoProps {
  size?: LogoSize;
  className?: string;
}

const AnimaliaLogo = ({ size = 'md', className = '' }: AnimaliaLogoProps) => (
  <img
    src="/animalia-logo.png"
    alt="Animalia Welfare and More"
    className={`animalia-logo animalia-logo--${size}${className ? ` ${className}` : ''}`}
  />
);

export default AnimaliaLogo;
