import { getTemplate } from '@utils/form-actions';
import { NextResponse, type NextRequest } from 'next/server';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
): Promise<NextResponse<TemplateDto | null>> {
  const { templateId } = await params;

  const template = await getTemplate(templateId);

  return NextResponse.json(template ?? null);
}
