import { Route, Controller, Post, Get, Tags } from "tsoa";
import { CityUploadService } from "../../application/city-upload.service";
import { City } from "../../domain/entity/city";

@Route("cities")
@Tags("City")
export class CityController extends Controller {
  private readonly cityUploadService: CityUploadService;

  constructor() {
    super();
    this.cityUploadService = new CityUploadService();
  }

  /**
   * Endpoint para cargar ciudades y departamentos desde un archivo JSON
   */
  @Post("upload")
  public async uploadCitiesAndDepartments(): Promise<void> {
    await this.cityUploadService.uploadCitiesAndDepartments();
    this.setStatus(200); // Indica que la operación fue exitosa
  }

  /**
   * Endpoint para obtener todas las ciudades
   */
  @Get()
  public async getAllCities(): Promise<City[]> {
    const cities = await this.cityUploadService.getAllCities(); // Implementa este método en el servicio
    return cities;
  }
}
