import { SummaryList } from 'nhsuk-react-components';
import {
  letterTypeDisplayMappings,
  type LetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Filename } from '@atoms/Filename/Filename';
import content from '@content/content';
import {
  DetailSection,
  PreviewTemplateDetailsContainer,
  StandardDetailRows,
} from './common';
import styles from './PreviewTemplateDetails.module.scss';
import Link from 'next/link';

const { rowHeadings } = content.components.previewTemplateDetails;

export default function PreviewTemplateDetailsLetter({
  template,
  user,
}: {
  template: LetterTemplate;
  user?: string;
}) {
  const proofFilenames = Object.values(template.files.proofs ?? {})
    .filter(({ virusScanStatus }) => virusScanStatus === 'PASSED')
    .map(({ fileName }) => fileName);

  const showProofs =
    proofFilenames.length > 0 &&
    (template.templateStatus === 'PROOF_AVAILABLE' ||
      template.templateStatus === 'SUBMITTED');

  return (
    <PreviewTemplateDetailsContainer template={template}>
      <DetailSection>
        <StandardDetailRows
          template={template}
          templateTypeText={letterTypeDisplayMappings(
            template.letterType,
            template.language
          )}
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
              {rowHeadings.testPersonalisationFile}
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
            <SummaryList.Key>{rowHeadings.templateProofFiles}</SummaryList.Key>
            <SummaryList.Value>
              <ul className={styles.proofs}>
                {proofFilenames.map((file) => (
                  <li key={file}>
                    <Link
                      href={`/files/${user}/proofs/${template.id}/${file}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      data-testid='proof-link'
                    >
                      <Filename filename={file} />
                    </Link>
                  </li>
                ))}
              </ul>
            </SummaryList.Value>
          </SummaryList.Row>
        </DetailSection>
      )}
    </PreviewTemplateDetailsContainer>
  );
}
