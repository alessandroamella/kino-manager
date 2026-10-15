// Loads .env into process.env before any module is evaluated: decorators like
// @WebSocketGateway and JwtModule.register read process.env at import time,
// before ConfigModule has run.
import { config } from 'dotenv';

config({ quiet: true });
