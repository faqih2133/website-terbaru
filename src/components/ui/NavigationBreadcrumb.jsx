import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const NavigationBreadcrumb = ({ customBreadcrumbs = null }) => {
  const location = useLocation();

  const routeMap = {
    '/login': { label: 'Masuk', parent: null },
    '/admin-dashboard': { label: 'Dashboard Admin', parent: null },
    '/evaluator-dashboard': { label: 'Dashboard Evaluator', parent: null },
    '/supervisor-approval': { label: 'Persetujuan Atasan', parent: '/admin-dashboard' },
    '/behavioral-assessment': { label: 'Penilaian Perilaku', parent: '/evaluator-dashboard' },
  };

  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const breadcrumbs = [];
    const currentRoute = routeMap?.[location?.pathname];

    if (!currentRoute) {
      return [{ label: 'Beranda', path: '/admin-dashboard' }];
    }

    if (currentRoute?.parent) {
      const parentRoute = routeMap?.[currentRoute?.parent];
      if (parentRoute) {
        breadcrumbs?.push({
          label: parentRoute?.label,
          path: currentRoute?.parent,
        });
      }
    }

    breadcrumbs?.push({
      label: currentRoute?.label,
      path: location?.pathname,
      isActive: true,
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs?.length <= 1 && breadcrumbs?.[0]?.isActive) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 py-3" aria-label="Breadcrumb">
      <Link
        to="/admin-dashboard"
        className="text-muted-foreground hover:text-foreground transition-smooth"
        aria-label="Kembali ke beranda"
      >
        <Icon name="Home" size={16} />
      </Link>
      {breadcrumbs?.map((crumb, index) => (
        <React.Fragment key={crumb?.path || index}>
          <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
          {crumb?.isActive ? (
            <span className="text-sm font-medium text-foreground caption">
              {crumb?.label}
            </span>
          ) : (
            <Link
              to={crumb?.path}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth caption"
            >
              {crumb?.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default NavigationBreadcrumb;
