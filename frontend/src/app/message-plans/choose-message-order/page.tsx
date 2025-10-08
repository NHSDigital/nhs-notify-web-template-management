'use server';

import { ChooseMessageOrder } from '@forms/ChooseMessageOrder/ChooseMessageOrder';
import { Metadata } from 'next';
import content from '@content/content';

const { pageTitle } = content.components.chooseMessageOrder;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
  };
}

const ChooseMessageOrderPage = async () => {
  return <ChooseMessageOrder />;
};

export default ChooseMessageOrderPage;
