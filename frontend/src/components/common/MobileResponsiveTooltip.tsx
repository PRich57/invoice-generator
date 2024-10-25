import React from 'react';
import { Tooltip as MuiTooltip, useMediaQuery, useTheme } from '@mui/material';

interface MobileResponsiveTooltipProps {
  children: React.ReactElement;
  title: React.ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  arrow?: boolean;
  open?: boolean;
}

const MobileResponsiveTooltip: React.FC<MobileResponsiveTooltipProps> = ({
  children,
  title,
  placement = 'top',
  arrow = false,
  open
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile) {
    return children;
  }

  return (
    <MuiTooltip 
      title={title} 
      placement={placement} 
      arrow={arrow}
      open={open}
    >
      {children}
    </MuiTooltip>
  );
};

export default MobileResponsiveTooltip;