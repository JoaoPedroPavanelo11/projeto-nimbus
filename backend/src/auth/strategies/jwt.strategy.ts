import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface.js';
import { userRole } from '../../user/enums/user.role.enums.js';

interface JwtPayload {
    sub: string;
    email: string;
    role: userRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET!,
        });
    }

    validate(payload: JwtPayload): AuthenticatedUser {
        return { id: payload.sub, email: payload.email, role: payload.role };
    }
}