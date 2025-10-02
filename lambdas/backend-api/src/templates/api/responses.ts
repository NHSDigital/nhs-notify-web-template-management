import type {
  Failure,
  TemplateDto,
  RoutingConfig,
} from 'nhs-notify-backend-client';

export const apiSuccess = <
  T extends TemplateDto | TemplateDto[] | RoutingConfig | RoutingConfig[],
>(
  statusCode: number,
  result: T
) => {
  return {
    statusCode,
    body: JSON.stringify({
      statusCode,
      data: result,
    }),
  };
};

export const apiFailure = (
  statusCode: number,
  technicalMessage: string,
  details?: unknown
) => ({
  statusCode,
  body: JSON.stringify({
    statusCode,
    technicalMessage,
    details,
  } satisfies Failure),
});
