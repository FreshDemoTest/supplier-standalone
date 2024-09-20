import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { forwardRef, useEffect, useCallback } from 'react';
// material
import { Box } from '@mui/material';
// utils
import track from '../utils/analytics';
import { alimaAppDeployment } from '../config';

// ----------------------------------------------------------------------
type PageProps = {
  children: any;
  title: string;
  other?: Array<any>;
};

const Page = forwardRef(
  ({ children, title = '', ...other }: PageProps, ref) => {
    const { pathname } = useLocation();

    const sendPageViewEvent = useCallback(() => {
      track('page_view', {
        page_title: title,
        page_location: `${alimaAppDeployment.publicUrl}${pathname}`,
        page_path: pathname,
        visit: window.location.toString()
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      sendPageViewEvent();
    }, [sendPageViewEvent]);

    return (
      <Box ref={ref} {...other}>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        {children}
      </Box>
    );
  }
);

export default Page;
