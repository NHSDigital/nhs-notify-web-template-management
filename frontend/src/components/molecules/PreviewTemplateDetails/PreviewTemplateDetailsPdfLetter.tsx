'use client';

import { Container, SummaryList } from 'nhsuk-react-components';
import {
  letterTypeDisplayMappings,
  PdfLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Filename } from '@atoms/Filename/Filename';
import content from '@content/content';
import {
  DetailSection,
  DetailsHeader,
  LockedTemplateWarning,
  StandardDetailRows,
} from './common';
import styles from './PreviewTemplateDetails.module.scss';
import { getBasePath } from '@utils/get-base-path';
import concatClassNames from '@utils/concat-class-names';
import { useFeatureFlags } from '@providers/client-config-provider';

const { rowHeadings } = content.components.previewTemplateDetails;

export default function PreviewTemplateDetailsPdfLetter({
  template,
  hideStatus,
}: {
  template: PdfLetterTemplate;
  hideStatus?: boolean;
}) {
  const features = useFeatureFlags();

  const proofFilenames = Object.values(template.files.proofs ?? {})
    .filter(({ virusScanStatus }) => virusScanStatus === 'PASSED')
    .map(({ fileName }) => fileName);

  const showProofs =
    proofFilenames.length > 0 &&
    (template.templateStatus === 'PROOF_AVAILABLE' ||
      template.templateStatus === 'PROOF_APPROVED' ||
      template.templateStatus === 'SUBMITTED') &&
    template.clientId;

  return (
    <>
      <DetailsHeader templateName={template.name} />

      {features.routing && template.templateStatus === 'SUBMITTED' && (
        <LockedTemplateWarning template={template} />
      )}

      <Container
        className={concatClassNames('nhsuk-u-margin-bottom-6', 'nhsuk-body-m')}
      >
        <DetailSection>
          <StandardDetailRows
            template={template}
            templateTypeText={letterTypeDisplayMappings(
              template.letterType,
              template.language
            )}
            templateTypeHeading={rowHeadings.templateType}
            campaignId={template.campaignId}
            hideStatus={hideStatus}
          />
          <SummaryList.Row>
            <SummaryList.Key>{rowHeadings.templateFile}</SummaryList.Key>
            <SummaryList.Value>
              <Filename filename={template.files.pdfTemplate.fileName} />
            </SummaryList.Value>
          </SummaryList.Row>
          {template.files.testDataCsv?.fileName && (
            <SummaryList.Row>
              <SummaryList.Key>
                {rowHeadings.examplePersonalisationFile}
              </SummaryList.Key>
              <SummaryList.Value>
                <Filename filename={template.files.testDataCsv.fileName} />
              </SummaryList.Value>
            </SummaryList.Row>
          )}
        </DetailSection>

        {showProofs && (
          <DetailSection>
            <SummaryList.Row>
              <SummaryList.Key>
                {rowHeadings.templateProofFiles}
              </SummaryList.Key>
              <SummaryList.Value>
                <ul className={styles.proofs}>
                  {proofFilenames.map((file) => (
                    <li key={file}>
                      <a
                        href={`${getBasePath()}/files/${template.clientId}/proofs/${template.id}/${file}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        data-testid={`proof-link_${file}`}
                      >
                        <Filename filename={file} />
                      </a>
                    </li>
                  ))}
                </ul>
              </SummaryList.Value>
            </SummaryList.Row>
          </DetailSection>
        )}
      </Container>
    </>
  );
}
