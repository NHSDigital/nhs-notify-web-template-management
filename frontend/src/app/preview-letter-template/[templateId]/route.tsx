import { getTemplate } from '@utils/form-actions';
import type { NextRequest } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;

  const template = await getTemplate(templateId);

  return Response.json(template);
}
