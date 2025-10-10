import type {
  Failure,
  TemplateDto,
  RoutingConfig,
} from 'nhs-notify-backend-client';

type Count = { count: number };

export const apiSuccess = <
  T extends
    | Count
    | RoutingConfig
    | RoutingConfig[]
    | TemplateDto
    | TemplateDto[],
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

export const noContent = {
  statusCode: 204,
  body: JSON.stringify({
    statusCode: 204,
  }),
};
