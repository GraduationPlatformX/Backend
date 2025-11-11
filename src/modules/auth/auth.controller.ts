import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {  SigninDto, SignupDto } from "./dto";
import { Public } from "src/common/decorators/public-endpoint.decorator";
import { User } from "src/common/decorators/user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authservice: AuthService) {}

  @Post("signup")
  @Public()
  signup(@Body() dto: SignupDto) {
   return  this.authservice.signup(dto)
  }

  @Post("signin")
  @Public()
  signin(@Body() dto: SigninDto) {
   return this.authservice.signin(dto)
  }

  @Post("logout")
  logout(@User() user) {
   return this.authservice.logout(user)
  }

  @Get("me")
  me(@User() user) {
   return this.authservice.me(user)
  }
}
