export class Store{
    constructor(
        public id: number,
        public name: string,
        public address: string,
        public latitude: number,
        public longitude: number,
        public cityId: number,
        public capacity: number,
        public zipCode: string,
        public status: "ACTIVE" | "INACTIVE" = "ACTIVE",
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date(),
    ){}
}

