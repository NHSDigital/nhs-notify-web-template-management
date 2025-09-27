'use server';

import { Metadata } from 'next';
import { CreateEditMessagePlan } from '@organisms/CreateEditMessagePlan/CreateEditMessagePlan';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Choose templates for your message plan - NHS Notify',
  };
}

export default async function ChooseTemplatesPage() {
  const plan = {
    id: 'b838b13c-f98c-4def-93f0-515d4e4f4ee1',
    name: 'test',
    status: 'Draft',
  };

  return <CreateEditMessagePlan plan={plan} />;
}
