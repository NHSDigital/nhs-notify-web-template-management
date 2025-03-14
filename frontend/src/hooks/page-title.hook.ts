import { useEffect } from 'react';

const PageTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

export default PageTitle;
