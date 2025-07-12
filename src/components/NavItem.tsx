import { Link, useLocation } from 'react-router-dom';
import Icon, { IconName } from '@/components/Icon';
import { useTranslation } from 'react-i18next';

interface NavItemProps {
  label: string;
  href: string;
  icon: IconName;
  isExternal?: boolean;
}

const NavItem = ({ label, href, icon, isExternal = false }: NavItemProps) => {
  const location = useLocation();
  const { t } = useTranslation('nav');
  const isActive = location.pathname === href;

  const className = `px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group relative ${
    isActive 
      ? 'bg-primary/10 text-primary border border-primary/20' 
      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
  }`;

  if (isExternal) {
    return (
      <a href={href} className={className}>
        <Icon 
          name={icon} 
          className={`w-4 h-4 transition-colors ${
            isActive ? 'text-primary' : 'group-hover:text-primary'
          }`} 
        />
        <span className="font-medium">{t(label)}</span>
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      <Icon 
        name={icon} 
        className={`w-4 h-4 transition-colors ${
          isActive ? 'text-primary' : 'group-hover:text-primary'
        }`} 
      />
      <span className="font-medium">{t(label)}</span>
    </Link>
  );
};

export default NavItem;