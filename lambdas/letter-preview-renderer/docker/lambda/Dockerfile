ARG BASE_IMAGE

FROM ${BASE_IMAGE}

COPY dist/* ${LAMBDA_TASK_ROOT}/

CMD [ "letter-preview-renderer.handler" ]
