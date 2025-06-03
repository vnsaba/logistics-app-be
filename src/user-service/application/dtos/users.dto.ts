export class UserDto {
    id!: number;
    firstName!: string;
    lastName!: string;
    fullaName!: string;
    gender!: string;
    gsm!: string;
    createdAt!: Date;
    isActive!: boolean;
    avatar!: {
        name: string;
        percent: number;
        size: number;
        status: string;
        type: string;
        uid: string;
        url: string;
    }[];
    addresses!: { //reempalzar esa informacion por la ciudad y el departamento
        text: string;
        coordinate: CoordinateDto;
    }[];
}


// coordinate.dto.ts
export class CoordinateDto {
  lat!: string;
  lng!: string;
}
