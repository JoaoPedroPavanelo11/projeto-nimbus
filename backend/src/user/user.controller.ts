import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { userRole } from './enums/user.role.enums.js';
import type { AuthenticatedUser } from '../common/types/authenticated-user.interface.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  // Perfil do proprio usuario logado
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.findOne(user.id, user);
  }

  // Lista todos os usuarios - so admin/officer
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(userRole.ADMIN, userRole.OFFICER)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.userService.findOne(id, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() user: AuthenticatedUser) {
    return this.userService.update(id, updateUserDto, user);
  }

  // Excluir usuario - so admin
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(userRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
