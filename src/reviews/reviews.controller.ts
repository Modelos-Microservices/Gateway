import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards, Req, Logger } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
// Asumiendo que NATS_SERVICE y otras configuraciones están en 'src/config'
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
// Asumiendo que las guardias y decoradores están en 'src/keyCloak'
import { KeycloakAuthGuard } from 'src/keyCloak/keycloak-auth.guard';
import { RolesGuard } from 'src/keyCloak/keycloak-roles.guard';
import { Protect } from 'src/keyCloak/protect.decorator';
import { Roles } from 'src/keyCloak/role.decorator';
import { Public } from 'src/keyCloak/public.decorator'; // Asegúrate de que este decorador está implementado si lo usas
import { firstValueFrom } from 'rxjs';
import { UserService } from 'src/user/user.service';
import { Request } from 'express'; // Importa Request de express

@Controller('reviews')
@UseGuards(KeycloakAuthGuard, RolesGuard) // Aplicar guardias a nivel de controlador si la mayoría de rutas están protegidas
export class ReviewsController {
  constructor(
      // Inyectamos el cliente NATS. Asumimos que este cliente se usa para comunicarse con el reviews-ms
      @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
      @Inject(UserService) private readonly userService: UserService,
  ) {}

  private logger = new Logger(ReviewsController.name); // Logger para el controlador

  @Protect() 
  @Roles('user', 'admin') // Define roles permitidos
  @Post()
  async create(@Body() createReviewDto: CreateReviewDto, @Req() req: Request) {
    let userId: string;
    try {
        userId = this.userService.extractUserIdFromToken(req);
        if (!userId) {
             throw new RpcException({ status: 401, message: 'User ID not found in token' });
        }
    } catch (error) {
         console.error('Error extracting user ID from token:', error);
         throw new RpcException({ status: 401, message: 'Authentication failed or user ID not found' });
    }
    const payload = { ...createReviewDto, user_id: userId };
    
    try {
      const review = await firstValueFrom(this.natsClient.send({ cmd: 'createReview' }, payload));
      return review;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Public() // Permite acceso sin autenticación ni roles
  @Get()
  async findAll() {
    try {
      const reviews = await firstValueFrom(this.natsClient.send({ cmd: 'findAllReviews' }, {})); // Pasar un objeto vacío si no hay payload
      return reviews;
    } catch (error) {
       throw new RpcException(error);
    }
  }

  @Public() // Permite acceso sin autenticación ni roles
  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Validamos que el ID sea un string (UUID) no vacío
    if (typeof id !== 'string' || id.length === 0) {
         throw new RpcException({ status: 400, message: 'Invalid Review ID format' });
    }
    try {
      // Enviamos el comando 'findOneReview' al microservicio con el ID como string
      const review = await firstValueFrom(this.natsClient.send({ cmd: 'findOneReview' }, id));
      return review;
    } catch (error) {
       throw new RpcException(error);
    }
  }

  @Protect() // Aplica la protección
  @Roles('user', 'admin') // Define roles permitidos
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @Req() req: Request) {
    // Validamos que el ID sea un string (UUID) no vacío
     if (typeof id !== 'string' || id.length === 0) {
         throw new RpcException({ status: 400, message: 'Invalid Review ID format' });
     }

    let userId: string;
    try {
        // Extraemos el userId del token/request
        userId = this.userService.extractUserIdFromToken(req);
         if (!userId) {
             throw new RpcException({ status: 401, message: 'User ID not found in token' });
         }
    } catch (error) {
         console.error('Error extracting user ID from token:', error);
         throw new RpcException({ status: 401, message: 'Authentication failed or user ID not found' });
    }

    // Preparamos el payload para el microservicio. Incluimos el ID, los datos de actualización y el ID del usuario
    const payload = {...updateReviewDto, userId: userId };

    try {
      // Enviamos el comando 'updateReview' al microservicio
      const updatedReview = await firstValueFrom(this.natsClient.send({ cmd: 'updateReview' }, payload));
      return updatedReview;
    } catch (error) {
       // Capturamos y re-lanzamos errores del microservicio
       throw new RpcException(error);
    }
  }

  @Public() // Permite acceso sin autenticación ni roles
  @Delete(':id')
  async remove(@Param('id') id: string) {
     // Validamos que el ID sea un string (UUID) no vacío
    if (typeof id !== 'string' || id.length === 0) {
         throw new RpcException({ status: 400, message: 'Invalid Review ID format' });
    }
    try {
       // Enviamos el comando 'removeReview' al microservicio con el ID como string
      const deletedReview = await firstValueFrom(this.natsClient.send({ cmd: 'removeReview' }, id));
      return deletedReview;
    } catch (error) {
       throw new RpcException(error);
    }
  }
}