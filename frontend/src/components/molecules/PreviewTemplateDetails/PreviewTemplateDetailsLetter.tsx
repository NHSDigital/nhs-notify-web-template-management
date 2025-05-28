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

const { rowHeadings } = content.components.previewTemplateDetails;

export function PreviewTemplateDetailsLetter({
  template,
}: {
  template: LetterTemplate;
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
            <SummaryList.Value className={styles.proofsList}>
              {proofFilenames.map((file) => (
                <Filename key={file} filename={file} />
              ))}
            </SummaryList.Value>
          </SummaryList.Row>
        </DetailSection>
      )}
    </PreviewTemplateDetailsContainer>
  );
}
