export function mockTestDataCsv(
  parameters: string[],
  parameterInput: Record<string, string>[]
) {
  const headers = `"Personalisation field","Short length data example","Medium length data example","Long length data example"`;
  const rows = parameters.map((p) =>
    [
      `"${p}"`,
      `"${parameterInput[0][p]}"`,
      `"${parameterInput[1][p]}"`,
      `"${parameterInput[2][p]}"`,
    ].join(',')
  );
  return [headers, ...rows].join('\n').concat('\n');
}
