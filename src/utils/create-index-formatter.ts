export const createIndexFormatter = (
  template: string,
): ((...args: number[]) => string) => {
  const requiredCount = (template.match(/#/g) || []).length;

  return (...args: number[]): string => {
    if (args.length !== requiredCount) {
      throw new Error(
        `Formatter Mismatch: Template requires ${requiredCount} arguments, but received ${args.length}.`,
      );
    }

    let argIndex = 0;

    return template.replace(/#/g, () => {
      const replacement = String(args[argIndex]);
      argIndex++;
      return replacement;
    });
  };
};
