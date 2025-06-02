import { prismaMongo } from "../../../../prisma/index";
import { IlocationRepository } from "../../domain/interface/Location.interface";
import { DeliverylocationDto , SaveDeliverylocationDto} from "../../domain/dto/deliveryLocation.dto";

export class LocationRepository implements IlocationRepository {
    async saveLocation(data: SaveDeliverylocationDto): Promise<void> {
        await prismaMongo.location.create({
            data: {
                userId: data.deliveryId,
                latitude: data.latitude,
                longitude: data.longitude,
                timestamp: new Date()
            }
        })
    }

    async getCurrentLocation(deliveryId: string): Promise<DeliverylocationDto | null> {
        const location = await prismaMongo.location.findFirst({
            where: { userId: deliveryId },
            orderBy: {
                timestamp: 'desc'
            }
        })
        if (!location) {
            return null;
        }

        return {
            deliveryId: location.userId,
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: location.timestamp.toISOString()
        }
    }

    async getLocationHistory(deliveryId: string, from: Date, to: Date): Promise<DeliverylocationDto[]> {
        const locations = await prismaMongo.location.findMany({
            where: {
                userId: deliveryId,
                timestamp: {
                    gte: from,
                    lte: to
                }
            },
            orderBy: {
                timestamp: 'asc'
            }
        });

        return locations.map(location => ({
            deliveryId: location.userId,
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: location.timestamp.toISOString()
        }));

    }
}