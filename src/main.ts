import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AuthGuard } from "./common/guards/auth.guard";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "./modules/database/prisma.service";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );
  app.useGlobalInterceptors(new ResponseInterceptor());

  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  const prismaService = app.get(PrismaService);
  app.useGlobalGuards(new AuthGuard(reflector, jwtService, prismaService));

  // Serve static files
  app.useStaticAssets(join(__dirname, "..", "uploads"));

  // Enable CORS
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
