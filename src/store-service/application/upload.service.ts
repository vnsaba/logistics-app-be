import { IStoreRepository } from '../domain/interfaces/store.interface';
import { FileReaderInterface } from '../../shared/domain/interfaces/fileReader.interface';

export class UploadStoreService {
  constructor(
    // @ts-expect-error: Not using storeRepository yet
    private readonly storeRepository: IStoreRepository,
    private readonly fileReader: FileReaderInterface
  ) {}

  async upload<F, T>({
    file,
    separator,
  }: {
    file: F;
    separator: string;
  }): Promise<{ successCount: number; errors: string[] }> {
    const { data, error } = await this.fileReader.read<T>({
      file,
      separator,
    });

    if (error) {
      return { successCount: 0, errors: ['Could not process the file'] };
    }

    console.log('Data read from file:', data);

    // lógica de carga de datos (ciudades, tiendas, etc.)

    return { successCount: data.length, errors: [] };
  }
}
