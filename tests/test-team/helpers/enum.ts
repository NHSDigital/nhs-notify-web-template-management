export const MESSAGE_ORDERS = [
  'NHSAPP',
  'NHSAPP,EMAIL',
  'NHSAPP,SMS',
  'NHSAPP,EMAIL,SMS',
  'NHSAPP,SMS,EMAIL',
  'NHSAPP,SMS,LETTER',
  'NHSAPP,EMAIL,SMS,LETTER',
  'LETTER',
] as const;

export type MessageOrder = (typeof MESSAGE_ORDERS)[number];

export const ROUTING_CONFIG_MESSAGE_ORDER_OPTION_MAPPINGS: Array<{
  messageOrder: MessageOrder;
  label: string;
}> = [
  {
    messageOrder: 'NHSAPP',
    label: 'NHS App only',
  },
  {
    messageOrder: 'NHSAPP,EMAIL',
    label: 'NHS App, Email',
  },
  {
    messageOrder: 'NHSAPP,SMS',
    label: 'NHS App, Text message',
  },
  {
    messageOrder: 'NHSAPP,EMAIL,SMS',
    label: 'NHS App, Email, Text message',
  },
  {
    messageOrder: 'NHSAPP,SMS,EMAIL',
    label: 'NHS App, Text message, Email',
  },
  {
    messageOrder: 'NHSAPP,SMS,LETTER',
    label: 'NHS App, Text message, Letter',
  },
  {
    messageOrder: 'NHSAPP,EMAIL,SMS,LETTER',
    label: 'NHS App, Email, Text message, Letter',
  },
  {
    messageOrder: 'LETTER',
    label: 'Letter only',
  },
];
