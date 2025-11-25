// Utilities Types

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

type BuildTuple<
  Type,
  Length extends number,
  Acc extends Type[] = [],
> = Acc['length'] extends Length
  ? Acc
  : BuildTuple<Type, Length, [...Acc, Type]>;

export type FunctionWithArgs<N extends number, R = void> = (
  ...args: BuildTuple<number, N>
) => R;

type ArrayNumberPattern = `.${number}`;

type CountOccurrences<
  S extends string,
  Acc extends unknown[] = [],
> = S extends `${ArrayNumberPattern}${infer Rest}`
  ? CountOccurrences<Rest, [...Acc, 0]>
  : S extends `${infer _}${infer Rest}`
    ? CountOccurrences<Rest, Acc>
    : Acc['length'];

type CountArrayIndices<Path extends string> = CountOccurrences<Path>;

type ListFieldAccessor<Path extends string> = (
  ...args: BuildTuple<number, CountArrayIndices<Path>>
) => Path;

type TO_NAME<KEY> = Uppercase<CamelToSnakeCase<KEY & string>>;
type TO_FIELD_NAME<KEY> = `${Uppercase<CamelToSnakeCase<KEY & string>>}_FIELD`;
type TO_OBJECT_FIELD_NAME<KEY> = `$${Uppercase<
  CamelToSnakeCase<KEY & string>
>}`;

// DICT

type DICT_VALUE =
  | string
  | readonly { readonly [key: string]: DICT_VALUE }[]
  | { readonly [key: string]: DICT_VALUE };

export type DICT = Record<string, DICT_VALUE>;

type DICT_OBJECT_VALUE = { readonly [key: string]: DICT_VALUE };
type DICT_ARRAY_VALUE = readonly { readonly [key: string]: DICT_VALUE }[];

type DICT_NESTED_VALUES = DICT_ARRAY_VALUE | DICT_OBJECT_VALUE;

type SubArrayElement<Arr extends DICT_NESTED_VALUES> =
  Arr extends readonly (infer Obj)[] ? Obj : never;

type PathGenerator<Path extends string> =
  CountArrayIndices<Path> extends 0 ? Path : ListFieldAccessor<Path>;

type ObjectFieldNameGenerator<
  Key extends string,
  Field extends DICT_OBJECT_VALUE,
> = Field[Key] extends string ? TO_FIELD_NAME<Key> : TO_OBJECT_FIELD_NAME<Key>;

type IsListedBefore<Path extends string> =
  CountArrayIndices<Path> extends 0 ? false : true;

type ExceptNumber<Key, Result> = Key extends `${number}` ? never : Result;

// Context Types

export type Context = {
  path: string;
};

// Fields Group Types

type FieldsGroup<
  Field extends DICT_NESTED_VALUES,
  Path extends string,
  FieldName extends string,
> = {
  readonly KEY: FieldName;
  readonly PATH: PathGenerator<Path>;
} & {
  [KEY in keyof Field as Field[KEY] extends string
    ? TO_NAME<KEY>
    : never]: Field[KEY];
} & {
  [KEY in keyof SubArrayElement<Field> as ObjectFieldNameGenerator<
    KEY & string,
    SubArrayElement<Field>
  >]: SubArrayElement<Field>[KEY] extends DICT_NESTED_VALUES
    ? FieldsGroup<
        SubArrayElement<Field>[KEY],
        `${Path}.${number}.${KEY & string}`,
        KEY & string
      >
    : ListFieldAccessor<`${Path}.${number}.${KEY & string}`>;
} & {
  [KEY in keyof Field as Field[KEY] extends DICT_NESTED_VALUES
    ? ExceptNumber<KEY, TO_OBJECT_FIELD_NAME<KEY>>
    : never]: Field[KEY] extends DICT_OBJECT_VALUE
    ? FieldsGroup<Field[KEY], `${Path}.${KEY & string}`, KEY & string>
    : Field[KEY] extends DICT_ARRAY_VALUE
      ? FieldsGroup<Field[KEY], `${Path}.${KEY & string}`, KEY & string>
      : never;
} & {
  [KEY in keyof Field as Field[KEY] extends string
    ? TO_FIELD_NAME<KEY>
    : never]: IsListedBefore<Path> extends true
    ? ListFieldAccessor<`${Path}.${Field[KEY] & string}`>
    : `${Path}.${Field[KEY] & string}`;
};

export type GenerateFields<Fields extends DICT> = {
  [KEY in keyof Fields as Fields[KEY] extends string
    ? TO_FIELD_NAME<KEY>
    : never]: Fields[KEY];
} & {
  [KEY in keyof Fields as Fields[KEY] extends string
    ? TO_NAME<KEY>
    : never]: Fields[KEY];
} & {
  [KEY in keyof Fields as Fields[KEY] extends DICT_NESTED_VALUES
    ? TO_OBJECT_FIELD_NAME<KEY>
    : never]: Fields[KEY] extends DICT_NESTED_VALUES
    ? FieldsGroup<Fields[KEY], KEY & string, KEY & string>
    : never;
};
