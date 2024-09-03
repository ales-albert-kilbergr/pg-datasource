export class InvalidQueryArgError<C extends string> extends Error {
  /**
   * A code of the error
   */
  public readonly code: C;
  /**
   * A name of the query argument that caused the error.
   */
  public readonly arg: string;
  /**
   * OPTIONAL: a value which caused the error.
   */
  public readonly value?: unknown;

  public readonly constraints?: Record<string, string>;

  // eslint-disable-next-line @typescript-eslint/max-params
  private constructor(
    code: C,
    arg: string,
    constraints: Record<string, string>,
    value?: unknown,
  ) {
    const stringifiedReason = Object.entries(constraints)
      .map(([key, val]) => `${key}: ${val}`)
      .join(', ');

    super(`Invalid Query Argument: ${arg}. ${stringifiedReason}`);

    this.code = code;
    this.arg = arg;
    this.constraints = constraints;
    this.value = value;
  }

  public static IsRequired<C extends string>(
    code: C,
    arg: string,
  ): InvalidQueryArgError<C> {
    return new InvalidQueryArgError(code, arg, {
      required: `The argument is required.`,
    });
  }
}
