import { RoastService } from './roast.service';
import { CreateRoastDto } from '../../dto/create-roast.dto';
export declare class RoastController {
    private readonly roastService;
    private readonly logger;
    constructor(roastService: RoastService);
    createRoast(createRoastDto: CreateRoastDto): Promise<any>;
    getRoast(username: string, temperature?: number, customInstructions?: string): Promise<any>;
}
