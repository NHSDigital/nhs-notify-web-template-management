'use client';

import { ZodErrorSummary } from '@molecules/ZodErrorSummary/ZodErrorSummary';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { Container, Row, Col, Tag } from 'nhsuk-react-components';
import { TemplateType, TemplateStatus } from '@utils/enum';
import concatClassNames from '@utils/concat-class-names';
import styles from './ReviewTemplate.module.scss';
import { ReviewTemplateProps } from './review-template.types';

const templateTypeDisplayMappings = (type: TemplateType) =>
  ({
    [TemplateType.NHS_APP]: 'NHS App',
    [TemplateType.SMS]: 'Text message (SMS)',
    [TemplateType.EMAIL]: 'Email',
    [TemplateType.LETTER]: 'Letter',
  })[type];

const templateStatustoDisplayMappings = (status: TemplateStatus) =>
  ({
    [TemplateStatus.NOT_YET_SUBMITTED]: 'Not yet submitted',
    [TemplateStatus.SUBMITTED]: 'Submitted',
  })[status];

export function ReviewTemplate({
  form,
  ...props
}: Readonly<ReviewTemplateProps>) {
  return (
    <>
      <div className='notify-confirmation-panel nhsuk-heading-l'>
        {props.sectionHeading}
      </div>
      <ZodErrorSummary errorHeading={form.errorHeading} state={form.state} />
      <h1
        data-testid='preview-message__heading'
        className={styles.review__heading}
      >
        {props.template.name}
      </h1>
      <Container
        className={concatClassNames('nhsuk-u-margin-bottom-4', 'nhsuk-body-m')}
      >
        <div className={styles.preview}>
          <Row className={styles.preview__row}>
            <Col width='one-third' className={styles.preview__col}>
              <div className={styles.preview__col_heading}>Template ID</div>
            </Col>
            <Col width='two-thirds' className={styles.col}>
              {props.template.id}
            </Col>
          </Row>
          <Row className={styles.preview__row}>
            <Col width='one-third' className={styles.preview__col}>
              <div className={styles.preview__col_heading}>Type</div>
            </Col>
            <Col width='two-thirds' className={styles.col}>
              {templateTypeDisplayMappings(props.template.templateType)}
            </Col>
          </Row>
          <Row className={styles.preview__row}>
            <Col width='one-third' className={styles.preview__col}>
              <div className={styles.preview__col_heading}>Status</div>
            </Col>
            <Col width='two-thirds' className={styles.col}>
              <Tag>
                {templateStatustoDisplayMappings(props.template.templateStatus)}
              </Tag>
            </Col>
          </Row>
        </div>
      </Container>
      {props.PreviewComponent}
      <NHSNotifyRadioButtonForm
        formId={form.formId}
        radiosId={form.radiosId}
        action={form.action}
        state={form.state}
        pageHeading={form.pageHeading}
        options={form.options}
        buttonText={form.buttonText}
        legend={{
          isPgeHeading: false,
          size: 'm',
        }}
      />
    </>
  );
}
