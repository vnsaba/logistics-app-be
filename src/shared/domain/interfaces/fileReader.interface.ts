export interface FileReaderInterface<F = unknown> {
  read<T>({
    file,
    separator,
  }: {
    file: F;
    separator: string;
  }): Promise<{ data: T[]; error?: string }>;
}
