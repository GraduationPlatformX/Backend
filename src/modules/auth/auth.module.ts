import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "604800s" },
    }),
    DatabaseModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule], // Export JwtModule so other modules can use it
})
export class AuthModule {}
