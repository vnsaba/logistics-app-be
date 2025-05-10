import { FileReaderInterface } from '../domain/interfaces/fileReader.interface';
import { Readable } from 'stream';
import csv from 'csv-parser';

export class MulterFileReader
  implements FileReaderInterface<Express.Multer.File>
{
  async read<T>({
    file,
    separator = ',',
  }: {
    file: Express.Multer.File;
    separator: string;
  }): Promise<{ data: T[]; error?: string }> {
    const results: T[] = [];

    const stream = Readable.from(file.buffer);

    return await new Promise<{ data: T[]; error?: string }>(
      (resolve, reject) => {
        stream
          .pipe(csv({ separator }))
          .on('data', data => {
            results.push(data);
          })
          .on('end', () => resolve({ data: results }))
          .on('error', err => reject({ data: [], error: err }));
      }
    );
  }
}
