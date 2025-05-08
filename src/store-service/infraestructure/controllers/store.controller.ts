import { Route, Controller, Post, UploadedFile } from 'tsoa';
import { UploadStoreService } from '../../application/upload.service';
import { StoreRepository } from '../repository/store.repository';
import { MulterFileReader } from '../../../shared/infraestructure/multerFileReader';

@Route('stores')
export class StoreController extends Controller {
  // private readonly userService: UserService;
  private readonly uploadStoreService: UploadStoreService;

  constructor() {
    super();

    const storeRepository = new StoreRepository();
    const multerFileReader = new MulterFileReader();

    this.uploadStoreService = new UploadStoreService(
      storeRepository,
      multerFileReader
    );
  }

  @Post('upload')
  public async loadStores(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadStoreService.upload<
      Express.Multer.File,
      { id: string; last_name3: string; last_name4: string; last_name5: string }
    >({ file, separator: ';' });
  }
}
