import { Container, SummaryList } from 'nhsuk-react-components';
import {
  letterTypeDisplayMappings,
  type LetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Filename } from '@atoms/Filename/Filename';
import content from '@content/content';
import { DetailSection, DetailsHeader, StandardDetailRows } from './common';
import styles from './PreviewTemplateDetails.module.scss';
import { getBasePath } from '@utils/get-base-path';
import concatClassNames from '@utils/concat-class-names';

const { rowHeadings } = content.components.previewTemplateDetails;

export default function PreviewTemplateDetailsLetter({
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
      template.templateStatus === 'SUBMITTED') &&
    template.owner;

  const owner = template.owner ?? '';
  const proofOwner = owner.startsWith('CLIENT#') ? owner.slice(6) : owner;

  return (
    <>
      <DetailsHeader templateName={template.name} />
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
                        href={`${getBasePath()}/files/${proofOwner}/proofs/${template.id}/${file}`}
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
