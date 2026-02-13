FROM ghcr.io/nhsdigital/nhs-notify/letter-renderer-node-22:latest

# Copy the built output from the build context (docker.sh should have run build.sh already)
COPY dist/index.js ${LAMBDA_TASK_ROOT}/index.js

CMD [ "index.handler" ]
