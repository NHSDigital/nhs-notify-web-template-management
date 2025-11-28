type ListType = 'ol' | 'ul';

export function markdownList(listType: ListType, list: string[]) {
  return list
    .map((item, index) => {
      let prefix = '-';

      if (listType === 'ol') {
        prefix = `${index + 1}.`;
      }

      return `${prefix} ${item}`;
    })
    .join('\n');
}
