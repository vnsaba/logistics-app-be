import { IStoreRepository } from '../domain/interfaces/store.interface';
import { FileReaderInterface } from '../../shared/domain/interfaces/fileReader.interface';

export class UploadStoreService {
  constructor(
    private readonly storeRepository: IStoreRepository,
    private readonly fileReader: FileReaderInterface
  ) {}

  async upload<F, T>({
    file,
    separator,
  }: {
    file: F;
    separator: string;
  }): Promise<{ sucessCount: number; errors: string[] }> {
    const { data, error } = await this.fileReader.read<T>({
      file,
      separator,
    });

    if (error) {
      return { sucessCount: 0, errors: ['Could not process the file'] };
    }

    console.log('Data read from file:', data);

    // lógica de carga de datos (ciudades, tiendas, etc.)

    const newStore = await this.storeRepository.create({
      address: 'Av. Siempre Viva 742',
      capacity: 100,
      city_id: 'city_123',
      latitude: -12.0464,
      longitude: -77.0428,
      name: 'Tienda Central',
      status: 'active',
      zip_code: '15001',
    });

    console.log('New store created:', newStore); // para evitar unused typescript error

    return { sucessCount: data.length, errors: [] };
  }
}
