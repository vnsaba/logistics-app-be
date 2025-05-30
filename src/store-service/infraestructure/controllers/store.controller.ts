import {
  Route,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Path,
  Body,
  UploadedFile,
  Tags,
} from "tsoa";
import { StoreService } from "../../application/store.service";
import { UploadStoreService } from "../../application/uploadStore.service";
import { StoreRepository } from "../repository/store.repository";
import { MulterFileReader } from "../../../shared/infraestructure/multerFileReader";
import { CreateStoreDto } from "../dto/create-store.dto";
import { UpdateStoreDto } from "../dto/update-store.dto";
import { Store } from "../../domain/entity/store";
import { UserRepository } from "../../../user-service/infraestructure/repository/user.repository";

@Route("stores")
@Tags("Store")
export class StoreController extends Controller {
  private readonly uploadStoreService: UploadStoreService;
  private readonly storeService: StoreService;

  constructor() {
    super();

    const storeRepository = new StoreRepository();
    const multerFileReader = new MulterFileReader();
    const userRepository = new UserRepository();

    this.storeService = new StoreService(storeRepository, userRepository);
    this.uploadStoreService = new UploadStoreService(
      storeRepository,
      multerFileReader
    );
  }

  @Post("upload")
  public async loadStores(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadStoreService.upload<
      Express.Multer.File,
      { id: string; last_name: string; phone: string; isbn: string }
    >({
      file,
      separator: ";",
    });
  }

  @Post()
  public async createStore(@Body() body: CreateStoreDto) {
    return await this.storeService.create(body);
  }

  @Get()
  public async getAllStores(): Promise<Store[]> {
    return await this.storeService.getAll();
  }

  @Get("{id}")
  public async getStoreById(@Path() id: number): Promise<Store | null> {
    return await this.storeService.getById(id);
  }

  @Get("name/{name}")
  public async getStoreByName(@Path() name: string): Promise<Store | null> {
    return await this.storeService.getByName(name);
  }

  @Put("{id}")
  public async updateStore(
    @Path() id: number,
    @Body() body: UpdateStoreDto
  ): Promise<Store> {
    return await this.storeService.update(id, body);
  }

  @Delete("{id}")
  public async deleteStore(@Path() id: number): Promise<void> {
    await this.storeService.delete(id);
  }

  // todo: revisar que sirva
  @Get("manager/{managerId}")
  public async getStoresByManager(@Path() managerId: string): Promise<Store[]> {
    return await this.storeService.getByManager(managerId);
  }
}
