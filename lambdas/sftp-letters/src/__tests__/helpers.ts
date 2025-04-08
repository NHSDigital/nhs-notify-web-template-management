export function mockTestData<const T extends string>(
  parameters: T[],
  parameterInput: [Record<T, string>, Record<T, string>, Record<T, string>]
) {
  const headers = 'parameter,short example,medium example,long example';
  const rows = parameters.map((p) =>
    [
      `"${p}"`,
      `"${parameterInput[0][p]}"`,
      `"${parameterInput[1][p]}"`,
      `"${parameterInput[2][p]}"`,
    ].join(',')
  );
  return [headers, ...rows].join('\n');
}
